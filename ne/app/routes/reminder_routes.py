from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.connection import get_db
from app.services.reminder_service import ReminderService
from app.schemas.reminder_schema import ReminderSchema

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.post(
    "/trigger-refills",
    summary="[Refill Reminders] Manually trigger batch refill check for all active prescriptions"
)
def trigger_refills(db: Session = Depends(get_db)):
    # [Refill Reminders] — runs the full batch check: calculates days left for every active
    # prescription and sends an SMS to those running low on stock
    try:
        service = ReminderService(db)
        reminders_created = service.check_and_create_reminders()
        return {
            "status": "success",
            "message": f"Refill reminders checked at {datetime.now(timezone.utc).isoformat()}.",
            "reminders_created": reminders_created
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/create-from-stock/{prescription_id}",
    response_model=ReminderSchema,
    summary="[Dose Reminders] Create and schedule a dose reminder for a given prescription"
)
def create_dose_reminder(prescription_id: int, db: Session = Depends(get_db)):
    # [Dose Reminders] — reads issued stock for the prescription, calculates the next dose time,
    # persists a Reminder row, and schedules an APScheduler date-triggered job for the SMS
    try:
        service = ReminderService(db)
        reminder = service.create_dose_reminder_from_stock(prescription_id)
        return reminder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
