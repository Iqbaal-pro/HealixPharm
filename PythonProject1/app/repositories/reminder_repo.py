from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from datetime import datetime

class ReminderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, prescription_id: int, reminder_time: datetime):
        reminder = Reminder(
            prescription_id=prescription_id,
            reminder_time=reminder_time,
            status="pending"
        )
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def get_pending_reminders(self):
        return (
            self.db.query(Reminder)
            .filter(Reminder.status == "pending", Reminder.reminder_time <= datetime.utcnow())
            .all()
        )

    def update_status(self, reminder_id: int, status: str):
        reminder = self.db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if reminder:
            reminder.status = status
            self.db.commit()
            self.db.refresh(reminder)
        return reminder
