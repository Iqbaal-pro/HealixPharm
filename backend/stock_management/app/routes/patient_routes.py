"""
Patient Routes – API endpoints for patient CRUD and consent management.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.patient import Patient
from app.repositories.patient_repo import PatientRepository

router = APIRouter(prefix="/patients", tags=["Patients"])


# ─── Request schemas ────────────────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    phone_number: str
    language: str = "en"
    consent: bool = False


class ConsentUpdate(BaseModel):
    consent: bool


# ─── DB session dependency ──────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Create a new patient ──────────────────────────────────────────
@router.post("/")
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient in the system."""
    repo = PatientRepository(db)

    patient = Patient(
        name=data.name,
        phone_number=data.phone_number,
        language=data.language,
        consent=data.consent
    )
    created = repo.create(patient)

    return {
        "message": "Patient created",
        "patient_id": created.id,
        "member_id": created.member_id,
        "name": created.name,
        "consent": created.consent
    }


# ─── List all patients ─────────────────────────────────────────────
@router.get("/")
def list_patients(db: Session = Depends(get_db)):
    """Return all patients."""
    repo = PatientRepository(db)
    patients = repo.get_all()

    return [
        {
            "id": p.id,
            "member_id": p.member_id,
            "name": p.name,
            "phone_number": p.phone_number,
            "language": p.language,
            "consent": p.consent
        }
        for p in patients
    ]


# ─── Update patient consent ────────────────────────────────────────
@router.put("/{patient_id}/consent")
def update_consent(
    patient_id: int,
    data: ConsentUpdate,
    db: Session = Depends(get_db)
):
    """
    Toggle a patient's SMS consent.
    When consent is revoked, the scheduler will skip this patient.
    """
    repo = PatientRepository(db)
    patient = repo.update_consent(patient_id, data.consent)

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "message": f"Consent {'granted' if data.consent else 'revoked'} "
                   f"for patient {patient.name}",
        "patient_id": patient.id,
        "consent": patient.consent
    }

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    repo = PatientRepository(db)

    patient = repo.get_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    repo.delete(patient_id)

    return {
        "message": f"Patient '{patient.name}' deleted successfully",
        "patient_id": patient_id
    }