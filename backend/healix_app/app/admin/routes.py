from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.admin import schemas
from app.services.notification_service import NotificationService
from app.services.stock_integration import StockIntegrationService
from app.services.s3_service import generate_presigned_url
from app.services import alert_service
from app.whatsapp.state import UserState_wb
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])
notif = NotificationService()

stock_bridge = StockIntegrationService()

class StatusUpdate(BaseModel):
    status: str

class MessagePayload(BaseModel):
    body: str

@router.get("/orders", response_model=List[schemas.OrderSimpleSchema])
def list_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    """List all orders with optional status filter."""
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status.upper())
    
    orders = query.order_by(models.Order.created_at.desc()).all()
    result = []
    for o in orders:
        res = schemas.OrderSimpleSchema.from_orm(o)
        res.phone = o.patient.phone_number
        res.patient_id = o.patient_id
        if o.prescription and o.prescription.s3_key:
            try:
                res.prescription_url = generate_presigned_url(o.prescription.s3_key)
            except Exception as e:
                logger.warning(f"Failed to generate presigned URL for order {o.id}: {e}")
        result.append(res)
    return result


@router.get("/orders/{order_id}", response_model=schemas.OrderDetailSchema)
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    """Get full details of a specific order."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    res = schemas.OrderDetailSchema.from_orm(order)
    res.phone = order.patient.phone_number
    if order.prescription:
        # Generate a fresh 1-hour presigned URL for the frontend
        res.prescription_url = generate_presigned_url(order.prescription.s3_key)
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

    # First pass: check availability for ALL items before reserving any
    for item in payload.items:
        med_details = stock_bridge.get_medicine_details(item.medicine_id)
        if not med_details:
            raise HTTPException(status_code=400, detail=f"Medicine ID {item.medicine_id} not found in Stock DB")

        availability = stock_bridge.check_stock_availability(item.medicine_id, item.quantity)
        if not availability["sufficient"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {med_details['name']}: "
                       f"requested {item.quantity}, available {availability['available']}"
            )

    # Second pass: reserve stock and build order items
    for item in payload.items:
        med_details = stock_bridge.get_medicine_details(item.medicine_id)

        success = stock_bridge.reserve_stock(item.medicine_id, item.quantity)
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to reserve stock for {med_details['name']}")

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
    
    UserState_wb.set_user_state(order.patient.phone_number, "awaiting_payment_selection")
    
    db.commit()

    try:
        msg = (
            f"Your order has been approved! ✅\n\n"
            f"Total Amount: Rs. {total_amount:.2f}\n"
            f"Please choose your payment method:\n"
            f"1️⃣ Cash on Delivery\n"
            f"2️⃣ Online Payment\n\n"
            f"⚠️ Please confirm within 2 hours or the order will be cancelled."
        )
        notif.twilio_wa.send_text(order.patient.phone_number, msg)
    except Exception as e:
        logger.error(f"Failed to send approval message to {order.patient.phone_number}: {e}")

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
        for item in order.items:
            stock_bridge.release_stock(item.medicine_id, item.quantity)
            
        try:
            user_phone = order.patient.phone_number if order.patient else None
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
    
    try:
        notif.twilio_wa.send_text(order.patient.phone_number, f"Payment received for Order {order.token}! ✅ Your medicine is being prepared for delivery.")
    except Exception as e:
        logger.error(f"Failed to send payment confirmation: {e}")
        
    return {"status": "PAID", "order_id": order.id}


@router.get("/medicines/{medicine_id}/stock")
def get_medicine_stock(medicine_id: int):
    """
    Get real-time stock availability for a medicine from the Stock Management DB.
    Returns price, available quantity, reserved quantity, and net available.
    """
    stock_info = stock_bridge.get_available_stock(medicine_id)
    if not stock_info:
        raise HTTPException(status_code=404, detail="Medicine not found in Stock DB")
    return stock_info


@router.post("/orders/{order_id}/fulfill")
def fulfill_order(order_id: int, db: Session = Depends(get_db)):
    """
    Mark order as delivered/fulfilled.
    Deducts stock from quantity_available and clears quantity_reserved in Stock DB.
    Sends WhatsApp delivery confirmation to customer.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ["PAID", "CONFIRMED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot fulfill order in '{order.status}' status. Must be PAID or CONFIRMED."
        )

    # Deduct stock for each order item
    for item in order.items:
        success = stock_bridge.deduct_stock(item.medicine_id, item.quantity)
        if not success:
            logger.error(f"Failed to deduct stock for med_id {item.medicine_id} in order {order_id}")

    order.status = "DELIVERED"
    db.commit()

    # Notify customer
    try:
        item_lines = "\n".join([f"  • {i.medicine_name} x{i.quantity} — Rs. {i.subtotal:.2f}" for i in order.items])
        msg = (
            f"Your order {order.token} has been delivered! 🚚✅\n\n"
            f"Items:\n{item_lines}\n\n"
            f"Total: Rs. {order.total_amount:.2f}\n\n"
            f"Thank you for choosing Healix Pharm! 💊"
        )
        notif.twilio_wa.send_text(order.patient.phone_number, msg)
    except Exception as e:
        logger.error(f"Failed to send delivery notification: {e}")

    return {
        "id": order.id,
        "token": order.token,
        "status": "DELIVERED",
        "items_fulfilled": len(order.items)
    }


@router.post("/orders/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancel an order and release all reserved stock.
    Sends WhatsApp cancellation notification to customer.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "DELIVERED":
        raise HTTPException(status_code=400, detail="Cannot cancel a delivered order")

    # Release reserved stock for each item
    for item in order.items:
        stock_bridge.release_stock(item.medicine_id, item.quantity)

    order.status = "CANCELLED"
    order.cancelled_at = datetime.utcnow()
    db.commit()

    # Notify customer
    try:
        notif.twilio_wa.send_text(
            order.patient.phone_number,
            f"Your order {order.token} has been cancelled. ❌\n"
            f"If you need help, type 'menu' to reach us."
        )
    except Exception as e:
        logger.error(f"Failed to send cancellation notification: {e}")

    return {
        "id": order.id,
        "token": order.token,
        "status": "CANCELLED"
    }


@router.get("/support/queue")
def list_support_queue(db: Session = Depends(get_db)):
    """List all users waiting for an agent."""
    tickets = db.query(models.SupportTicket).filter(models.SupportTicket.status == "WAITING").all()
    result = []
    for t in tickets:
        result.append({
            "id": t.id,
            "patient_id": t.patient_id,
            "user_phone": t.patient.phone_number if t.patient else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return result


@router.post("/support/tickets/{ticket_id}/accept")
def accept_support_ticket(ticket_id: int, agent_name: str, db: Session = Depends(get_db)):
    """
    Agent accepts a waiting ticket.
    Transitions user state to 'live_chat' and notifies them.
    """
    from app.whatsapp.state import UserState_wb
    from datetime import datetime

    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status != "WAITING":
        raise HTTPException(status_code=400, detail=f"Ticket is already {ticket.status}")

    ticket.status = "ACTIVE"
    ticket.agent_id = agent_name
    ticket.accepted_at = datetime.utcnow()
    db.add(ticket)
    db.commit()

    # Update User State for WhatsApp Bot

    user_phone = ticket.patient.phone_number if ticket.patient else None
    if user_phone:
        UserState_wb.set_user_state(user_phone, "live_chat")
        UserState_wb.set_last_action(user_phone, "agent_connected")

        # Notify user via WhatsApp
        try:
            notif.send_agent_connected_notification(user_phone)
        except Exception as e:
            logger.error(f"Failed to notify user {user_phone} of agent connection: {e}")

    return {"status": "ACTIVE", "ticket_id": ticket.id, "user_phone": user_phone}


@router.post("/support/tickets/{ticket_id}/send")
def send_agent_message(ticket_id: int, payload: MessagePayload, db: Session = Depends(get_db)):
    """
    Stage 6: Agent sends a message to the user from Admin Portal.
    """
    from app.services.order_service import add_support_message
    
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket or ticket.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Active ticket not found")

    user_phone = ticket.patient.phone_number if ticket.patient else None
    if not user_phone:
        raise HTTPException(status_code=400, detail="User phone not found")

    # 1. Store message
    add_support_message(db, ticket_id, "AGENT", payload.body)

    # 2. Send via WhatsApp
    try:
        from app.whatsapp.twilio_client import TwilioWhatsAppClient
        twilio = TwilioWhatsAppClient()
        twilio.send_text(user_phone, payload.body)
    except Exception as e:
        logger.error(f"Failed to send agent message to {user_phone}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send WhatsApp message")

    return {"status": "SENT"}


@router.post("/support/tickets/{ticket_id}/close")
def admin_close_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """
    Pharmacy agent closes chat manually.
    Stage 7: Updates user state and notifies via WhatsApp
    """
    from app.whatsapp.state import UserState_wb
    from app.services.order_service import close_ticket

    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    user_phone = ticket.patient.phone_number if ticket.patient else None

    # Update DB
    close_ticket(db, ticket_id)

    # Update state and notify user
    if user_phone:
        UserState_wb.set_user_state(user_phone, "main_menu")
        try:
            from app.whatsapp.twilio_client import TwilioWhatsAppClient
            twilio = TwilioWhatsAppClient()
            twilio.send_text(user_phone, "Chat ended by pharmacy.\nYou have been returned to the main menu.")
        except Exception as e:
            logger.error(f"Failed to notify user {user_phone} of chat closure: {e}")

    return {"status": "CLOSED"}


@router.post("/moh-alert/create")
def create_moh_alert(payload: schemas.AlertCreate, db: Session = Depends(get_db)):
    """
    Build Admin API endpoint to create MOH alert.
    """
    if not payload.disease_name.strip():
        raise HTTPException(status_code=400, detail="disease_name not empty")
    if not payload.region.strip():
        raise HTTPException(status_code=400, detail="region not empty")

    threat_level = payload.threat_level.strip().capitalize()
    if threat_level not in ("Low", "Medium", "High"):
        raise HTTPException(status_code=400, detail="threat_level must be Low, Medium, or High")

    if payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="start_date <= end_date")

    new_alert = models.MOHDiseaseAlert(
        disease_name=payload.disease_name,
        region=payload.region,
        threat_level=threat_level,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="Active",
        broadcast_sent=False,
        retry_count=0
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert

@router.get("/alerts/active", response_model=List[schemas.AlertResponseSchema])
def list_active_moh_alerts(db: Session = Depends(get_db)):
    """List all currently active MOH disease alerts."""
    return alert_service.get_all_active_alerts(db)

@router.post("/notify/prescription-issued")
def notify_prescription_issued(payload: schemas.NotifyBillPayload, db: Session = Depends(get_db)):
    """
    Bridge endpoint for the pharmacist portal.
    Sends an itemized bill to the patient and transitions the Order to AWAITING_PAYMENT_SELECTION.
    """
    # 1. Update Order status if order_id is provided
    if payload.order_id:
        order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
        if order:
            order.status = "AWAITING_PAYMENT_SELECTION"
            order.total_amount = payload.total_amount
            db.commit()
            
            # Update user state in bot to handle the next input (1 or 2)
            UserState_wb.set_user_state(payload.patient_phone, "awaiting_payment_selection")
            logger.info(f"[ADMIN] Order {order.token} transitioned to AWAITING_PAYMENT_SELECTION")
        else:
            logger.warning(f"[ADMIN] Order ID {payload.order_id} not found in database!")

    # 2. Build and send WhatsApp message
    item_lines = "\n".join([f"  • {i.medicine_name} x{i.quantity} — Rs. {i.subtotal:.2f}" for i in payload.items])
    
    msg = (
        f"Your prescription has been reviewed and approved! ✅\n\n"
        f"*Bill Summary:*\n{item_lines}\n\n"
        f"*Total Amount: Rs. {payload.total_amount:.2f}*\n\n"
        f"Please choose your payment method:\n"
        f"1️⃣ Cash on Delivery\n"
        f"2️⃣ Online Payment\n\n"
        f"⚠️ Please respond with 1 or 2 to proceed."
    )
    
    try:
        notif.twilio_wa.send_text(payload.patient_phone, msg)
        return {"success": True, "message": "Notification sent and order updated"}
    except Exception as e:
        logger.error(f"Failed to send prescription issuance notification: {e}")
        return {"success": False, "message": f"Failed to send WhatsApp: {str(e)}"}
