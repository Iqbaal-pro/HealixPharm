from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])
notif = NotificationService()


class StatusUpdate(BaseModel):
    status: str


class MessagePayload(BaseModel):
    body: str


@router.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    """List orders for admin review."""
    orders = db.query(models.Order).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "token": o.token,
            "status": o.status,
            "user_phone": o.user.phone if o.user else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })
    return result


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
    db.add(order)
    db.commit()
    db.refresh(order)

    if status == "REJECTED":
        try:
            user_phone = order.user.phone if order.user else None
            if user_phone:
                notif.send_rejection_sms(user_phone, order.token)
        except Exception as e:
            logger.error(f"Failed to send rejection SMS for order {order.id}: {e}")

    return {"id": order.id, "token": order.token, "status": order.status}


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
