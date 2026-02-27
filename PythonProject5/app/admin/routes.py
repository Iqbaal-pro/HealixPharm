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


class StatusUpdate(BaseModel):
    status: str


class AlertCreate(BaseModel):
    disease_name: str
    region: str
    threat_level: str
    start_date: datetime
    end_date: datetime


class MessagePayload(BaseModel):
    body: str


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
def update_order_status(order_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
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


@router.post("/moh-alert/create")
def create_moh_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    """
    Build Admin API endpoint to create MOH alert.
    Validates threat_level and dates.
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


@router.get("/support/queue")
def list_support_queue(db: Session = Depends(get_db)):
    """List all users waiting for an agent."""
    tickets = db.query(models.SupportTicket).filter(models.SupportTicket.status == "WAITING").all()
    result = []
    for t in tickets:
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_phone": t.user.phone if t.user else None,
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

    # Update ticket
    ticket.status = "ACTIVE"
    ticket.agent_id = agent_name
    ticket.accepted_at = datetime.utcnow()
    db.add(ticket)
    db.commit()

    # Update User State for WhatsApp Bot
    user_phone = ticket.user.phone if ticket.user else None
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

    user_phone = ticket.user.phone if ticket.user else None
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
    Stage 7: Pharmacy agent closes chat manually.
    """
    from app.whatsapp.state import UserState_wb
    from app.services.order_service import close_ticket

    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    user_phone = ticket.user.phone if ticket.user else None
    
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
