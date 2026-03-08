from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base
from datetime import datetime, timezone


class ReminderLog(Base):
    """
    [Refill Reminders] — logs each SMS delivery attempt for a refill reminder.
    Stores whether the send succeeded or failed, and any error message.
    """
    __tablename__ = "reminder_logs"

    id = Column(Integer, primary_key=True, index=True)

    # [Refill Reminders] — which reminder this log entry belongs to
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=False)

    # [Refill Reminders] — UTC timestamp of the send attempt
    attempt_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # [Refill Reminders] — result of the send attempt: "sent" or "failed"
    result = Column(String(255), nullable=False)

    # [Refill Reminders] — populated if the send failed
    error_message = Column(String(255), nullable=True)
