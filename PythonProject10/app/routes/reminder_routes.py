from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.Service.reminder_service import create_one_reminder_from_stock

router = APIRouter(prefix="/reminders", tags=["Reminders"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create-from-stock/{prescription_id}")
def create_reminder(prescription_id: int, db: Session = Depends(get_db)):
    reminder = create_one_reminder_from_stock(db, prescription_id)

    return {
        "message": "Reminder scheduled successfully",
        "reminder_id": reminder.id,
        "time": reminder.reminder_time,
        "status": reminder.status
    }
