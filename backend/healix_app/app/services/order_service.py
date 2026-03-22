import uuid
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)


def get_or_create_patient(db: Session, phone: str, name: str = None) -> models.Patient:
    """
    Get a patient by phone_number or create if not exists.
    """
    from app.utils.encryption import decrypt_data
    patients = db.query(models.Patient).all()
    for p in patients:
        try:
            dec_phone = decrypt_data(p.phone_number)
            if dec_phone == phone:
                logger.info(f"[ORDER_SERVICE] Found existing patient via in-memory match: {phone}")
                return p
        except Exception:
            # If decryption fails (e.g. legacy plain text), skip or try direct match
            if p.phone_number == phone:
                return p
            continue

    patient = models.Patient(phone_number=phone, name=name)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    logger.info(f"[ORDER_SERVICE] Created new patient id={patient.id} phone={phone}")
    return patient


def create_order_with_prescription(db: Session, patient: models.Patient, image_s3_key: str, s3_url: str = None) -> (models.Order, models.Prescription):
    """
    Create an order and associated prescription record for a patient.
    """
    # generate tokens
    order_token = __import__("uuid").uuid4().hex[:10].upper()
    prescription_id = __import__("uuid").uuid4().hex

    order = models.Order(token=order_token, status="PENDING_VERIFICATION", patient_id=patient.id)
    db.add(order)
    db.commit()
    db.refresh(order)

    prescription = models.Prescription(
        prescription_id=prescription_id,
        order_id=order.id,
        patient_id=patient.id,
        medicine_id=1,  # Placeholder medicine for initial upload
        staff_id=1,     # Placeholder staff (Admin)
        uploaded_by_staff_id=1,
        medicine_name="WhatsApp Uploaded",
        s3_key=image_s3_key,
        s3_url=s3_url
    )
    db.add(prescription)
    db.commit()
    # db.refresh(prescription) # Optional as we return the object

    logger.info(f"[ORDER_SERVICE] Created order id={order.id} token={order.token} for patient={patient.id}")
    return order, prescription


def create_support_ticket(db: Session, patient: models.Patient) -> models.SupportTicket:
    """
    Create a new support ticket for a patient.
    """
    ticket = models.SupportTicket(patient_id=patient.id, status="WAITING")
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    logger.info(f"[ORDER_SERVICE] Created support ticket id={ticket.id} for patient={patient.id}")
    return ticket


def close_all_user_tickets(db: Session, patient: models.Patient):
    """
    Find and close all active or waiting tickets for a patient.
    """
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.patient_id == patient.id,
        models.SupportTicket.status.in_(["WAITING", "ACTIVE"])
    ).all()
    
    for t in tickets:
        t.status = "COMPLETED"
        db.add(t)
    
    if tickets:
        db.commit()
        logger.info(f"[ORDER_SERVICE] Closed {len(tickets)} support tickets for patient={patient.id}")


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
