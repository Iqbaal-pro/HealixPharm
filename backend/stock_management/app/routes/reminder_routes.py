"""
Reminder Routes – API endpoints for the pharmacist portal.
Handles one-time reminders, marking prescriptions as continuous,
and processing pending reminders.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.repositories.prescription_repo import PrescriptionRepository
from app.services.reminder_service import (
    send_one_time_reminder,
    process_pending_reminders,
    create_reminder
)
from app.repositories.reminder_repo import ReminderRepository

router = APIRouter(prefix="/reminders", tags=["Reminders"])


# ─── DB session dependency ──────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from pydantic import BaseModel

class CreateReminderRequest(BaseModel):
    prescription_id: int
    one_time: bool = False

# ─── Pharmacist checkbox: send one-time reminder immediately ────────
@router.post("/send-one-time/{prescription_id}")
def send_one_time(prescription_id: int, db: Session = Depends(get_db)):
    """
    Pharmacist clicks checkbox → immediate one-time SMS reminder.
    Does NOT create a persistent recurring schedule.
    """
    result = send_one_time_reminder(db, prescription_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "message": "One-time reminder sent successfully",
        "reminder_id": result["reminder_id"],
        "patient": result["patient_name"],
        "medicine": result["medicine"]
    }


# ─── Create a new reminder manually ───────────────────────────────
@router.post("/create")
def create_new_reminder(payload: CreateReminderRequest, db: Session = Depends(get_db)):
    """Insert a new reminder row in the REMINDERS table."""
    try:
        reminder = create_reminder(db, payload.prescription_id, payload.one_time)
        return {
            "message": "Reminder created successfully",
            "reminder_id": reminder.id,
            "status": reminder.status
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ─── Pharmacist checkbox: mark prescription as continuous ───────────
@router.post("/mark-continuous/{prescription_id}")
def mark_continuous(
    prescription_id: int,
    is_continuous: bool = True,
    db: Session = Depends(get_db)
):
    """
    Pharmacist marks a prescription as long-term/continuous.
    This enables the scheduler to auto-generate refill reminders.
    """
    repo = PrescriptionRepository(db)
    prescription = repo.set_continuous(prescription_id, is_continuous)

    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    return {
        "message": f"Prescription {prescription_id} marked as "
                   f"{'continuous' if is_continuous else 'not continuous'}",
        "prescription_id": prescription_id,
        "is_continuous": prescription.is_continuous
    }


# ─── List all pending reminders ─────────────────────────────────────
@router.get("/pending")
def list_pending_reminders(db: Session = Depends(get_db)):
    """Return all reminders currently in 'pending' status."""
    repo = ReminderRepository(db)
    pending = repo.get_pending()

    return [
        {
            "id": r.id,
            "prescription_id": r.prescription_id,
            "reminder_time": r.reminder_time,
            "channel": r.channel,
            "status": r.status,
            "one_time": r.one_time
        }
        for r in pending
    ]


# ─── Manually trigger processing pending reminders ──────────────────
@router.post("/process")
def process_reminders(db: Session = Depends(get_db)):
    """
    Manually trigger sending of all pending reminders.
    Useful for testing or ad-hoc processing outside the scheduler.
    """
    results = process_pending_reminders(db)

    sent_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - sent_count

    return {
        "message": f"Processed {len(results)} reminders "
                   f"({sent_count} sent, {failed_count} failed)",
        "results": results
    }
