from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from datetime import datetime, timezone


class ReminderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, prescription_id: int, reminder_time: datetime, **kwargs):
        # [Dose Reminders + Refill Reminders] — insert a new reminder row.
        # Dose reminders pass: medicine_name, dose_quantity, meal_timing via kwargs.
        # Refill reminders pass: only prescription_id and reminder_time.
        reminder = Reminder(
            prescription_id=prescription_id,
            reminder_time=reminder_time,
            status="pending",
            **kwargs
        )
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def get_pending_reminders(self):
        # [Refill Reminders] — return all pending reminders that are due now (UTC-aware)
        return (
            self.db.query(Reminder)
            .filter(
                Reminder.status == "pending",
                Reminder.reminder_time <= datetime.now(timezone.utc)
            )
            .all()
        )

    def has_pending_for_prescription(self, prescription_id: int) -> bool:
        # [Refill Reminders] — guard against creating duplicate pending reminders
        return (
            self.db.query(Reminder)
            .filter(
                Reminder.prescription_id == prescription_id,
                Reminder.status == "pending"
            )
            .first()
            is not None
        )

    def update_status(self, reminder_id: int, status: str):
        # [Refill Reminders] — update reminder status after SMS send attempt (sent / failed)
        reminder = self.db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if reminder:
            reminder.status = status
            self.db.commit()
            self.db.refresh(reminder)
        return reminder
