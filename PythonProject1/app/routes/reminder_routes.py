from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.connection import get_db
from app.services.reminder_service import ReminderService

router = APIRouter(prefix="/reminders", tags=["Refill Reminders"])

@router.post("/trigger-refills", summary="Manually trigger refill reminders for all prescriptions")
def trigger_refills(db: Session = Depends(get_db)):
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
