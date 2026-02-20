import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models_channelling import Appointment, Doctor

logger = logging.getLogger(__name__)

def is_slot_taken(db: Session, doctor_id: int, appointment_time: datetime) -> bool:
    """Check if a slot is already taken for a specific doctor at a given time."""
    logger.info(f"[ECHANN_SERVICE] Checking slot for doctor_id {doctor_id} at {appointment_time}")
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_time == appointment_time,
        Appointment.status == "PAID"
    ).first()
    return existing is not None

def create_pending_appointment(
    db: Session, 
    user_id: int, 
    user_phone: str,
    doctor_id: int,
    doctor_name: str, 
    specialty: str, 
    appointment_time: datetime, 
    fee: str,
    payhere_order_id: str
) -> Appointment:
    """Create a new appointment with PENDING_PAYMENT status."""
    logger.info(f"[ECHANN_SERVICE] Creating pending appointment for user {user_id} with doctor {doctor_name}")
    appointment = Appointment(
        user_id=user_id,
        user_phone=user_phone,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        specialty=specialty,
        appointment_time=appointment_time,
        fee=fee,
        status="PENDING_PAYMENT",
        payhere_order_id=payhere_order_id
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

def update_appointment_status(db: Session, payhere_order_id: str, new_status: str) -> bool:
    """Update appointment status based on PayHere order ID."""
    logger.info(f"[ECHANN_SERVICE] Updating appointment {payhere_order_id} to status {new_status}")
    appointment = db.query(Appointment).filter(Appointment.payhere_order_id == payhere_order_id).first()
    if appointment:
        appointment.status = new_status
        db.commit()
        return True
    logger.warning(f"[ECHANN_SERVICE] Appointment {payhere_order_id} not found for status update")
    return False

def get_doctor_by_id(db: Session, doctor_id: int) -> Doctor:
    """Retrieve doctor details by ID."""
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()

def seed_doctors_if_empty(db: Session):
    """Seed dummy doctors for testing if the table is empty."""
    if db.query(Doctor).count() == 0:
        logger.info("[ECHANN_SERVICE] Seeding initial doctors...")
        doctors = [
            Doctor(name="Dr. Aris", specialty="Cardiology", fee="2500.00"),
            Doctor(name="Dr. Sarah", specialty="Dermatology", fee="2000.00"),
            Doctor(name="Dr. Mendis", specialty="Pediatrics", fee="1800.00"),
        ]
        db.add_all(doctors)
        db.commit()
