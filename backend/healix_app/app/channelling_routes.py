import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db import get_db
from app.core.config import settings
from app.echannelling_service import (
    list_doctors, get_doctor, get_slots,
    create_pending_appointment, confirm_appointment, cancel_appointment
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


# ── Doctors ──────────────────────────────────────────────────────
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


# ── Slots ────────────────────────────────────────────────────────
@router.get("/doctors/{doctor_id}/slots")
async def get_doctor_slots(
    doctor_id: int,
    hospital:  str,
    date:      str,
    db: Session = Depends(get_db)
):
    return get_slots(db, doctor_id=doctor_id, hospital=hospital, date=date)


# ── Book ─────────────────────────────────────────────────────────
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

    # Generate PayHere hash for service charge only
    payhere_order_id   = f"CHANN_{appointment.booking_ref}"
    amount             = appointment.service_fee
    amount_formatted   = "{:.2f}".format(amount)
    secret_hash        = hashlib.md5(settings.PAYHERE_MERCHANT_SECRET.encode()).hexdigest().upper()
    hash_string        = settings.PAYHERE_MERCHANT_ID + payhere_order_id + amount_formatted + "LKR" + secret_hash
    payhere_hash       = hashlib.md5(hash_string.encode()).hexdigest().upper()

    # Save payhere_order_id to appointment
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


# ── PayHere Notify ───────────────────────────────────────────────
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

    # Verify signature
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
        # Payment successful — confirm appointment
        appointment = confirm_appointment(db, order_id)
        if appointment:
            logger.info(f"[CHANNELLING] Appointment {appointment.booking_ref} CONFIRMED")
    elif status_code in ["-1", "-2"]:
        # Payment failed or cancelled — free the slot
        appointment = cancel_appointment(db, order_id)
        if appointment:
            logger.info(f"[CHANNELLING] Appointment {appointment.booking_ref} CANCELLED")

    return {"status": "ok"}


# ── Lookup ───────────────────────────────────────────────────────
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

@router.post(/"appointments/{payhere_order_id}/cancel/")
async def cancel_existing_appointment(
    payhere_order_id: str,
    db: Session = Depends(get_db)
):
    """Manually cancel an appointment and free its slot."""
    appointment = cancel_appointment(db, payhere_order_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled", "booking_ref": appointment.booking_ref}
