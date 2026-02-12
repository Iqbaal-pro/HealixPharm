from sqlalchemy.orm import Session
from app.models.reminder_log import ReminderLog
from datetime import datetime, timezone


class ReminderLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_attempt(self, reminder_id: int, result: str, error_message: str = None):
        log = ReminderLog(
            reminder_id=reminder_id,
            attempt_time=datetime.now(timezone.utc),
            result=result,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
