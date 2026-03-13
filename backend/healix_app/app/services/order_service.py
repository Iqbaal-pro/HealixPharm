import uuid
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)


def get_or_create_user(db: Session, phone: str, name: str = None) -> models.WhatsAppUser:
    """
    Get a user by phone or create if not exists.
    """
    user = db.query(models.WhatsAppUser).filter(models.WhatsAppUser.phone == phone).first()
    if user:
        logger.info(f"[ORDER_SERVICE] Found existing user for phone {phone}")
        return user

    user = models.WhatsAppUser(phone=phone, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"[ORDER_SERVICE] Created new user id={user.id} phone={phone}")
    return user


def create_order_with_prescription(db: Session, user: models.WhatsAppUser, image_s3_key: str, s3_url: str = None) -> (models.Order, models.Prescription):
    """
    Create an order and associated prescription record automatically.
    Returns (order, prescription)
    """
    # generate tokens
    order_token = uuid.uuid4().hex[:10].upper()
    prescription_id = uuid.uuid4().hex

    order = models.Order(token=order_token, status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)

    prescription = models.Prescription(
        prescription_id=prescription_id,
        order_id=order.id,
        s3_key=image_s3_key,
        s3_url=s3_url
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    logger.info(f"[ORDER_SERVICE] Created order id={order.id} token={order.token} prescription={prescription.prescription_id}")
    return order, prescription


def create_support_ticket(db: Session, user: models.WhatsAppUser) -> models.SupportTicket:
    """
    Create a new support ticket for a user.
    """
    ticket = models.SupportTicket(user_id=user.id, status="WAITING")
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    logger.info(f"[ORDER_SERVICE] Created support ticket id={ticket.id} for user={user.id}")
    return ticket


def close_all_user_tickets(db: Session, user: models.WhatsAppUser):
    """
    Find and close all active or waiting tickets for a user.
    """
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.user_id == user.id,
        models.SupportTicket.status.in_(["WAITING", "ACTIVE"])
    ).all()
    
    for t in tickets:
        t.status = "COMPLETED"
        db.add(t)
    
    if tickets:
        db.commit()
        logger.info(f"[ORDER_SERVICE] Closed {len(tickets)} support tickets for user={user.id}")


def add_support_message(db: Session, ticket_id: int, sender_type: str, body: str) -> models.SupportMessage:
    """
    Save a support message to the database.
    """
    msg = models.SupportMessage(ticket_id=ticket_id, sender_type=sender_type, body=body)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def close_ticket(db: Session, ticket_id: int):
    """
    Close a specific support ticket.
    """
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if ticket:
        ticket.status = "COMPLETED"
        db.add(ticket)
        db.commit()
        logger.info(f"[ORDER_SERVICE] Ticket {ticket_id} manually closed.")
