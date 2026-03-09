from datetime import datetime
from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from app.models.reminder_log import ReminderLog


class ReminderRepository:
    """Repository for Reminder and ReminderLog operations."""

    def __init__(self, db: Session):
        self.db = db

    # ─── Reminder CRUD ──────────────────────────────────────────────

    def create(self, reminder: Reminder) -> Reminder:
        """Insert a new reminder row."""
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def get_pending(self):
        """Return all reminders with status='pending'."""
        return (
            self.db.query(Reminder)
            .filter(Reminder.status == "pending")
            .all()
        )

    def get_by_prescription_id(self, prescription_id: int):
        """Return all reminders for a specific prescription."""
        return (
            self.db.query(Reminder)
            .filter(Reminder.prescription_id == prescription_id)
            .all()
        )

    def mark_sent(self, reminder_id: int) -> Reminder:
        """Update reminder status from 'pending' to 'sent'."""
        reminder = (
            self.db.query(Reminder)
            .filter(Reminder.id == reminder_id)
            .first()
        )
        if reminder:
            reminder.status = "sent"
            self.db.commit()
            self.db.refresh(reminder)
        return reminder

    # ─── Reminder Logs ──────────────────────────────────────────────

    def log_attempt(
        self,
        reminder_id: int,
        channel: str,
        result: str,
        error_message: str = None
    ) -> ReminderLog:
        """
        Record an SMS send attempt in the reminder_logs table.
        result should be 'success' or 'failure'.
        """
        log = ReminderLog(
            reminder_id=reminder_id,
            attempt_time=datetime.utcnow(),
            channel=channel,
            result=result,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
