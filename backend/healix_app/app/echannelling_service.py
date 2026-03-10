import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.channelling_models import Doctor, Appointment

def list_doctors(db: Session):
    """List all available doctors."""
    return db.query(Doctor).all()

def generate_mock_slots(doctor_id: int):
    """Generate mock time slots for a doctor."""
    slots = []
    base_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
    for i in range(5):
        slot_time = base_time + timedelta(hours=i)
        slots.append({
            "id": f"slot_{i}",
            "time": slot_time.strftime("%Y-%m-%d %H:%M:%S"),
            "available": True
        })
    return slots

def create_pending_appointment(db: Session, user_id: int, user_phone: str, doctor: Doctor, appointment_time: datetime):
    """Create a new appointment with PENDING_PAYMENT status."""
    payhere_order_id = f"CHANN_{uuid.uuid4().hex[:8].upper()}"
    
    appointment = Appointment(
        user_id=user_id,
        user_phone=user_phone,
        doctor_id=doctor.id,
        doctor_name=doctor.name,
        specialty=doctor.specialty,
        appointment_time=appointment_time,
        fee=doctor.fee,
        status="PENDING_PAYMENT",
        payhere_order_id=payhere_order_id
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

def update_appointment_status(db: Session, payhere_order_id: str, status_code: int):
    """Update appointment status based on PayHere status code."""
    appointment = db.query(Appointment).filter(Appointment.payhere_order_id == payhere_order_id).first()
    if not appointment:
        return None
    
    if status_code == 2:
        appointment.status = "PAID"
    else:
        appointment.status = "FAILED"
    
    db.commit()
    db.refresh(appointment)
    return appointment
