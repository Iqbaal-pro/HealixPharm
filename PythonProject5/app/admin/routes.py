from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.admin import schemas
from app.services.notification_service import NotificationService
from app.services.stock_integration import StockIntegrationService
from app.whatsapp.state import UserState_wb
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])
notif = NotificationService()


stock_bridge = StockIntegrationService()


@router.get("/orders", response_model=List[schemas.OrderSimpleSchema])
def list_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    """List all orders with optional status filter."""
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status.upper())
    
    orders = query.order_by(models.Order.created_at.desc()).all()
    # Manual conversion to inject phone for the simple schema
    result = []
    for o in orders:
        res = schemas.OrderSimpleSchema.from_orm(o)
        res.phone = o.user.phone
        result.append(res)
    return result


@router.get("/orders/{order_id}", response_model=schemas.OrderDetailSchema)
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    """Get full details of a specific order."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    res = schemas.OrderDetailSchema.from_orm(order)
    res.phone = order.user.phone
    if order.prescription:
        res.prescription_url = order.prescription.s3_url
    return res


@router.get("/medicines/search")
def search_medicines(q: str):
    """Search medicines in the Stock Management MySQL DB."""
    return stock_bridge.search_medicine(q)


@router.post("/orders/{order_id}/approve")
def approve_order_itemized(order_id: int, payload: schemas.OrderApprovalPayload, db: Session = Depends(get_db)):
    """
    Pharmacist itemizes and approves an order.
    Calculates total, reserves stock in MySQL, and updates Bot status.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    total_amount = 0.0
    order_items = []

    for item in payload.items:
        # 1. Fetch price from Stock Management DB
        med_details = stock_bridge.get_medicine_details(item.medicine_id)
        if not med_details:
            raise HTTPException(status_code=400, detail=f"Medicine ID {item.medicine_id} not found in Stock DB")

        # 2. Reserve stock in Stock Management DB
        success = stock_bridge.reserve_stock(item.medicine_id, item.quantity)
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to reserve stock for {med_details['name']}")

        # 3. Create local OrderItem record
        subtotal = med_details['selling_price'] * item.quantity
        total_amount += subtotal
        
        new_item = models.OrderItem(
            order_id=order.id,
            medicine_id=item.medicine_id,
            medicine_name=med_details['name'],
            quantity=item.quantity,
            unit_price=med_details['selling_price'],
            subtotal=subtotal
        )
        db.add(new_item)
        order_items.append(new_item)

    order.status = "AWAITING_PAYMENT_SELECTION"
    order.total_amount = total_amount
    order.approved_at = datetime.utcnow()
    
    # Update user state to handle numeric reply
    UserState_wb.set_user_state(order.user.phone, "awaiting_payment_selection")
    
    db.commit()

    # 5. Notify User via WhatsApp (Phase 2 message)
    try:
        msg = (
            f"Your order has been approved! ✅\n\n"
            f"Total Amount: Rs. {total_amount:.2f}\n"
            f"Please choose your payment method:\n"
            f"1️⃣ Cash on Delivery\n"
            f"2️⃣ Online Payment\n\n"
            f"⚠️ Please confirm within 2 hours or the order will be cancelled."
        )
        notif.twilio_wa.send_text(order.user.phone, msg)
    except Exception as e:
        logger.error(f"Failed to send approval message to {order.user.phone}: {e}")

    return {
        "id": order.id,
        "token": order.token,
        "total_amount": total_amount,
        "status": order.status
    }


@router.post("/orders/{order_id}/status")
def update_order_status(order_id: int, payload: schemas.StatusUpdate, db: Session = Depends(get_db)):
    """
    Admin endpoint to update order status. Allowed values: APPROVED, REJECTED.
    Sending rejection SMS via Twilio when status == REJECTED.
    """
    status = payload.status.strip().upper()
    if status not in ("APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    if status == "APPROVED":
        order.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)

    if status == "REJECTED":
        # Release stock if items were previously itemized
        for item in order.items:
            stock_bridge.release_stock(item.medicine_id, item.quantity)
            
        try:
            user_phone = order.user.phone if order.user else None
            if user_phone:
                notif.send_rejection_sms(user_phone, order.token)
        except Exception as e:
            logger.error(f"Failed to send rejection SMS for order {order.id}: {e}")

    return {"id": order.id, "token": order.token, "status": order.status}


@router.post("/orders/{order_id}/confirm-payment")
def confirm_payment(order_id: int, db: Session = Depends(get_db)):
    """Admin manually confirms payment (e.g., for bank transfer or COD received)."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status not in ["AWAITING_PAYMENT", "CONFIRMED"]:
        raise HTTPException(status_code=400, detail=f"Cannot confirm payment for order in {order.status} status")
    
    order.status = "PAID"
    order.payment_status = "COMPLETED"
    db.commit()
    
    # Notify user
    try:
        notif.twilio_wa.send_text(order.user.phone, f"Payment received for Order {order.token}! ✅ Your medicine is being prepared for delivery.")
    except Exception as e:
        logger.error(f"Failed to send payment confirmation: {e}")
        
    return {"status": "PAID", "order_id": order.id}
