from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.db import SessionLocal
from app.repositories.channelling_repo import ChannellingRepository

router = APIRouter(prefix="/channelling", tags=["Channelling"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/doctors")
def get_all_doctors(db: Session = Depends(get_db)):
    """Fetch all doctors from the channelling system."""
    repo = ChannellingRepository(db)
    doctors = repo.get_all_doctors()
    return [{"id": d.id, "name": d.name, "specialization": d.specialization, "hospital": d.hospital, "fee": d.fee, "available": d.available} for d in doctors]

@router.get("/appointments")
def get_all_appointments(db: Session = Depends(get_db)):
    """Fetch all channelling appointments."""
    repo = ChannellingRepository(db)
    appointments = repo.get_all_appointments()
    return [{
        "id": a.id,
        "booking_ref": a.booking_ref,
        "doctor_id": a.doctor_id,
        "patient_id": a.patient_id,
        "hospital": a.hospital,
        "slot_time": a.slot_time,
        "date": a.date,
        "total_fee": a.total_fee,
        "status": a.status
    } for a in appointments]
