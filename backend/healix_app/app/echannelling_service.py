from datetime import date as dt_date
from sqlalchemy.orm import Session
from app.channelling_models import (
    Doctor, OtherHospital, TimeSlot,
    ChannellingPatient, ChannellingAppointment
)
from app.services.stock_integration import StockIntegrationService


def list_doctors(db: Session, spec: str = "", hospital: str = "", name: str = ""):
    q = db.query(Doctor).filter(Doctor.available == True)
    if spec:
        q = q.filter(Doctor.specialization == spec)
    if hospital:
        q = q.filter(Doctor.hospital == hospital)
    if name:
        q = q.filter(Doctor.name.ilike(f"%{name}%"))
    return [_doctor_to_dict(d) for d in q.all()]


def get_doctor(db: Session, doctor_id: int):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None
    return _doctor_to_dict(doctor)


def get_slots(db: Session, doctor_id: int, hospital: str, date: str):
    slots = db.query(TimeSlot).filter(
        TimeSlot.doctor_id     == doctor_id,
        TimeSlot.hospital_name == hospital,
        TimeSlot.date          == date,
    ).all()
    return [
        {
            "id":     s.id,
            "time":   s.time,
            "booked": s.booked,
            "date":   s.date,
        }
        for s in slots
    ]


def generate_booking_ref(db: Session) -> str:
    today  = dt_date.today().strftime("%Y%m%d")
    prefix = f"HLX-{today}-"
    count  = db.query(ChannellingAppointment).filter(
        ChannellingAppointment.booking_ref.like(f"{prefix}%")
    ).count()
    return f"{prefix}{str(count + 1).zfill(3)}"


def create_pending_appointment(db: Session, data: dict):
    """
    Creates appointment with PENDING_PAYMENT status.
    Called before PayHere payment — slot is held but not confirmed yet.
    """
    # 1. Check slot is free
    slot = db.query(TimeSlot).filter(TimeSlot.id == data["slot_id"]).first()
    if not slot:
        return None, "slot_not_found"
    if slot.booked:
        return None, "slot_taken"

    # 2. Get or create patient
    patient = db.query(ChannellingPatient).filter(
        ChannellingPatient.id_number == data["patient"]["id_number"]
    ).first()
    if not patient:
        p       = data["patient"]
        patient = ChannellingPatient(
            full_name = p["full_name"],
            id_type   = p["id_type"],
            id_number = p["id_number"],
            email     = p.get("email", ""),
            phone     = p["phone"],
            address   = p.get("address", ""),
        )
        db.add(patient)
        db.flush()

    # 3. Get doctor
    doctor = db.query(Doctor).filter(Doctor.id == data["doctor_id"]).first()
    if not doctor:
        return None, "doctor_not_found"

    # 4. Get service charge from pharmacy registration
    stock       = StockIntegrationService()
    service_fee = stock.get_channelling_service_charge()

    # 5. Generate booking ref and create appointment
    booking_ref = generate_booking_ref(db)
    appointment = ChannellingAppointment(
        booking_ref      = booking_ref,
        doctor_id        = doctor.id,
        patient_id       = patient.id,
        hospital         = data["hospital"],
        slot_time        = data["slot_time"],
        date             = data["date"],
        consultation_fee = doctor.fee,
        service_fee      = service_fee,
        total_fee        = doctor.fee + service_fee,
        notes            = data.get("notes", ""),
        status           = "PENDING_PAYMENT",
    )
    db.add(appointment)

    # 6. Hold the slot
    slot.booked = True

    db.commit()
    db.refresh(appointment)
    return appointment, None


def confirm_appointment(db: Session, payhere_order_id: str):
    """
    Called after PayHere payment confirmed.
    Updates appointment status to CONFIRMED.
    """
    appointment = db.query(ChannellingAppointment).filter(
        ChannellingAppointment.payhere_order_id == payhere_order_id
    ).first()
    if not appointment:
        return None
    appointment.status = "CONFIRMED"
    db.commit()
    db.refresh(appointment)
    return appointment


def cancel_appointment(db: Session, payhere_order_id: str):
    """
    Called if PayHere payment failed or cancelled.
    Frees the slot back up.
    """
    appointment = db.query(ChannellingAppointment).filter(
        ChannellingAppointment.payhere_order_id == payhere_order_id
    ).first()
    if not appointment:
        return None

    # Free the slot
    slot = db.query(TimeSlot).filter(
        TimeSlot.doctor_id     == appointment.doctor_id,
        TimeSlot.hospital_name == appointment.hospital,
        TimeSlot.time          == appointment.slot_time,
        TimeSlot.date          == appointment.date,
    ).first()
    if slot:
        slot.booked = False

    appointment.status = "CANCELLED"
    db.commit()
    return appointment


def _doctor_to_dict(d: Doctor):
    return {
        "id":             d.id,
        "name":           d.name,
        "specialization": d.specialization,
        "hospital":       d.hospital,
        "qualifications": d.qualifications or "",
        "experience":     d.experience or "",
        "fee":            d.fee,
        "serviceFee":     d.service_fee,
        "initials":       d.initials or d.name[:2].upper(),
        "available":      d.available,
        "otherHospitals": [
            {
                "id":    oh.id,
                "name":  oh.name,
                "days":  oh.days  or "",
                "hours": oh.hours or "",
            }
            for oh in d.other_hospitals
        ],
    }