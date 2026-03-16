import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db import get_db
from app.core.config import settings
from app.echannelling_service import (
    list_doctors, get_doctor, get_slots,
    create_pending_appointment, confirm_appointment, cancel_appointment,
    _doctor_to_dict
)

router = APIRouter(prefix="/api", tags=["Channelling"])
logger = logging.getLogger(__name__)


# ── Schemas ──────────────────────────────────────────────────────
class PatientIn(BaseModel):
    full_name: str
    id_type:   str
    id_number: str
    email:     Optional[str] = ""
    phone:     str
    address:   Optional[str] = ""
    notes:     Optional[str] = ""

class AppointmentIn(BaseModel):
    doctor_id: int
    hospital:  str
    slot_id:   int
    slot_time: str
    date:      str
    patient:   PatientIn

# Admin schemas — used by pharmacy portal to add/edit doctors and slots
class DoctorIn(BaseModel):
    name:           str
    specialization: str
    hospital:       str
    fee:            float
    experience:     Optional[str] = ""
    qualifications: Optional[str] = ""
    available:      bool = True
    initials:       Optional[str] = ""

class OtherHospitalIn(BaseModel):
    name:  str
    days:  Optional[str] = ""
    hours: Optional[str] = ""

class SlotIn(BaseModel):
    hospital: str
    date:     str
    time:     str


# ── Patient — Doctors ─────────────────────────────────────────────
@router.get("/doctors")
async def get_doctors(
    spec:     str = "",
    hospital: str = "",
    name:     str = "",
    db: Session = Depends(get_db)
):
    return list_doctors(db, spec=spec, hospital=hospital, name=name)


@router.get("/doctors/{doctor_id}")
async def get_single_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


# ── Patient — Slots ───────────────────────────────────────────────
@router.get("/doctors/{doctor_id}/slots")
async def get_doctor_slots(
    doctor_id: int,
    hospital:  str,
    date:      str,
    db: Session = Depends(get_db)
):
    return get_slots(db, doctor_id=doctor_id, hospital=hospital, date=date)


# ── Patient — Book ────────────────────────────────────────────────
@router.post("/appointments")
async def book_appointment(
    body: AppointmentIn,
    db:   Session = Depends(get_db)
):
    appointment, error = create_pending_appointment(db, {
        "doctor_id": body.doctor_id,
        "hospital":  body.hospital,
        "slot_id":   body.slot_id,
        "slot_time": body.slot_time,
        "date":      body.date,
        "notes":     body.patient.notes,
        "patient": {
            "full_name": body.patient.full_name,
            "id_type":   body.patient.id_type,
            "id_number": body.patient.id_number,
            "email":     body.patient.email,
            "phone":     body.patient.phone,
            "address":   body.patient.address,
        }
    })

    if error == "slot_taken":
        raise HTTPException(status_code=409, detail="This time slot has just been booked. Please select another.")
    if error == "slot_not_found":
        raise HTTPException(status_code=404, detail="Slot not found")
    if error == "doctor_not_found":
        raise HTTPException(status_code=404, detail="Doctor not found")

    payhere_order_id   = f"CHANN_{appointment.booking_ref}"
    amount             = appointment.service_fee
    amount_formatted   = "{:.2f}".format(amount)
    secret_hash        = hashlib.md5(settings.PAYHERE_MERCHANT_SECRET.encode()).hexdigest().upper()
    hash_string        = settings.PAYHERE_MERCHANT_ID + payhere_order_id + amount_formatted + "LKR" + secret_hash
    payhere_hash       = hashlib.md5(hash_string.encode()).hexdigest().upper()

    from app.channelling_models import ChannellingAppointment
    appt = db.query(ChannellingAppointment).filter(
        ChannellingAppointment.id == appointment.id
    ).first()
    appt.payhere_order_id = payhere_order_id
    db.commit()

    return {
        "booking_ref":    appointment.booking_ref,
        "appointment_id": appointment.id,
        "status":         appointment.status,
        "service_fee":    appointment.service_fee,
        "total_fee":      appointment.total_fee,
        "payhere": {
            "merchant_id": settings.PAYHERE_MERCHANT_ID,
            "order_id":    payhere_order_id,
            "amount":      amount_formatted,
            "currency":    "LKR",
            "hash":        payhere_hash,
            "notify_url":  f"{settings.BASE_URL}/api/channelling/payhere-notify",
            "return_url":  f"{settings.BASE_URL}/channelling/success",
            "cancel_url":  f"{settings.BASE_URL}/channelling/cancel",
            "items":       f"Doctor Appointment - {appointment.booking_ref}",
        }
    }


# ── PayHere Notify ────────────────────────────────────────────────
@router.post("/channelling/payhere-notify")
async def channelling_payhere_notify(
    request: Request,
    db:      Session = Depends(get_db)
):
    form_data  = await request.form()
    payload    = dict(form_data)
    order_id   = payload.get("order_id", "")
    status_code= payload.get("status_code")

    logger.info(f"[CHANNELLING] PayHere IPN | Order: {order_id} | Status: {status_code}")

    merchant_id      = payload.get("merchant_id", "")
    payhere_amount   = payload.get("payhere_amount", "")
    payhere_currency = payload.get("payhere_currency", "")
    md5sig           = payload.get("md5sig", "")
    secret_hash      = hashlib.md5(settings.PAYHERE_MERCHANT_SECRET.encode()).hexdigest().upper()
    check_string     = merchant_id + order_id + payhere_amount + payhere_currency + str(status_code) + secret_hash
    generated_sig    = hashlib.md5(check_string.encode()).hexdigest().upper()

    if generated_sig != md5sig:
        logger.error("[CHANNELLING] Invalid PayHere signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if status_code == "2":
        appointment = confirm_appointment(db, order_id)
        if appointment:
            logger.info(f"[CHANNELLING] Appointment {appointment.booking_ref} CONFIRMED")
    elif status_code in ["-1", "-2"]:
        appointment = cancel_appointment(db, order_id)
        if appointment:
            logger.info(f"[CHANNELLING] Appointment {appointment.booking_ref} CANCELLED")

    return {"status": "ok"}


# ── Patient — Lookup ──────────────────────────────────────────────
@router.get("/appointments/{booking_ref}")
async def get_appointment(
    booking_ref: str,
    db: Session = Depends(get_db)
):
    from app.channelling_models import ChannellingAppointment
    appt = db.query(ChannellingAppointment).filter(
        ChannellingAppointment.booking_ref == booking_ref
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {
        "booking_ref":    appt.booking_ref,
        "doctor":         appt.doctor.name,
        "hospital":       appt.hospital,
        "slot_time":      appt.slot_time,
        "date":           appt.date,
        "patient":        appt.patient.full_name,
        "total_fee":      appt.total_fee,
        "service_fee":    appt.service_fee,
        "status":         appt.status,
    }

@router.post("/appointments/{payhere_order_id}/cancel")
async def cancel_existing_appointment(
    payhere_order_id: str,
    db: Session = Depends(get_db)
):
    appointment = cancel_appointment(db, payhere_order_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled", "booking_ref": appointment.booking_ref}


# ── Admin — Doctors ───────────────────────────────────────────────
# These routes are used by the pharmacy portal to manage doctors and slots
# The pharmacy adds doctors here, patients see them in the booking portal

@router.post("/admin/doctors")
async def add_doctor(body: DoctorIn, db: Session = Depends(get_db)):
    from app.channelling_models import Doctor
    doctor = Doctor(
        name           = body.name,
        specialization = body.specialization,
        hospital       = body.hospital,
        fee            = body.fee,
        experience     = body.experience,
        qualifications = body.qualifications,
        available      = body.available,
        initials       = body.initials or body.name[:2].upper(),
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return _doctor_to_dict(doctor)

@router.get("/admin/doctors")
async def admin_list_doctors(db: Session = Depends(get_db)):
    from app.channelling_models import Doctor
    doctors = db.query(Doctor).order_by(Doctor.name).all()
    return [_doctor_to_dict(d) for d in doctors]

@router.put("/admin/doctors/{doctor_id}")
async def update_doctor(doctor_id: int, body: DoctorIn, db: Session = Depends(get_db)):
    from app.channelling_models import Doctor
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.name           = body.name
    doctor.specialization = body.specialization
    doctor.hospital       = body.hospital
    doctor.fee            = body.fee
    doctor.experience     = body.experience
    doctor.qualifications = body.qualifications
    doctor.available      = body.available
    doctor.initials       = body.initials or body.name[:2].upper()
    db.commit()
    db.refresh(doctor)
    return _doctor_to_dict(doctor)

@router.delete("/admin/doctors/{doctor_id}")
async def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    from app.channelling_models import Doctor
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted"}


# ── Admin — Other Hospitals ───────────────────────────────────────
@router.post("/admin/doctors/{doctor_id}/other-hospitals")
async def add_other_hospital(doctor_id: int, body: OtherHospitalIn, db: Session = Depends(get_db)):
    from app.channelling_models import OtherHospital
    oh = OtherHospital(
        doctor_id = doctor_id,
        name      = body.name,
        days      = body.days,
        hours     = body.hours,
    )
    db.add(oh)
    db.commit()
    db.refresh(oh)
    return oh

@router.delete("/admin/other-hospitals/{oh_id}")
async def delete_other_hospital(oh_id: int, db: Session = Depends(get_db)):
    from app.channelling_models import OtherHospital
    oh = db.query(OtherHospital).filter(OtherHospital.id == oh_id).first()
    if not oh:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(oh)
    db.commit()
    return {"message": "Deleted"}


# ── Admin — Slots ─────────────────────────────────────────────────
@router.post("/admin/doctors/{doctor_id}/slots")
async def add_slot(doctor_id: int, body: SlotIn, db: Session = Depends(get_db)):
    from app.channelling_models import TimeSlot
    slot = TimeSlot(
        doctor_id     = doctor_id,
        hospital_name = body.hospital,
        date          = body.date,
        time          = body.time,
        booked        = False,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.get("/admin/doctors/{doctor_id}/slots")
async def get_all_slots(doctor_id: int, db: Session = Depends(get_db)):
    from app.channelling_models import TimeSlot
    slots = db.query(TimeSlot).filter(
        TimeSlot.doctor_id == doctor_id
    ).order_by(TimeSlot.date, TimeSlot.time).all()
    return [{"id": s.id, "hospital": s.hospital_name, "date": s.date, "time": s.time, "booked": s.booked} for s in slots]

@router.delete("/admin/slots/{slot_id}")
async def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    from app.channelling_models import TimeSlot
    slot = db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted"}