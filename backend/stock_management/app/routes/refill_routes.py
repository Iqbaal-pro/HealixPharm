"""
Refill Routes – API endpoints for refill alerts and remaining days calculation.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.repositories.prescription_repo import PrescriptionRepository
from app.services.refill_service import (
    calculate_remaining_days,
    check_refill_needed,
    get_eligible_prescriptions
)

from typing import Optional

router = APIRouter(prefix="/refill", tags=["Refill"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/remaining-days/{prescription_id}")
def get_remaining_days(prescription_id: int, db: Session = Depends(get_db)):
    """Calculate how many days of medicine the patient has left."""
    repo = PrescriptionRepository(db)
    prescription = repo.get_by_id(prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    remaining = calculate_remaining_days(prescription)
    return {"prescription_id": prescription_id, "remaining_days": remaining}

@router.get("/check-needed/{prescription_id}")
def check_refill(prescription_id: int, threshold: Optional[int] = None, db: Session = Depends(get_db)):
    """Check if a refill is needed for a specific prescription."""
    repo = PrescriptionRepository(db)
    prescription = repo.get_by_id(prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    is_needed = check_refill_needed(prescription, threshold)
    return {"prescription_id": prescription_id, "refill_needed": is_needed}

@router.get("/eligible-prescriptions")
def list_eligible_prescriptions(db: Session = Depends(get_db)):
    """Get all prescriptions eligible for a refill reminder."""
    eligible = get_eligible_prescriptions(db)
    return [
        {
            "id": rx.id,
            "patient_id": rx.patient_id,
            "medicine_name": rx.medicine_name,
            "start_date": rx.start_date,
            "quantity_given": rx.quantity_given,
            "dose_per_day": rx.dose_per_day,
            "is_continuous": rx.is_continuous
        }
        for rx in eligible
    ]
