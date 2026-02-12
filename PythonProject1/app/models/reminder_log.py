from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base
from datetime import datetime, timezone


class ReminderLog(Base):
    __tablename__ = "reminder_logs"

    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=False)

    attempt_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    result = Column(String, nullable=False)  # sent / failed
    error_message = Column(String, nullable=True)
