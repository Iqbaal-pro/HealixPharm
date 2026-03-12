from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base


class ReminderLog(Base):
    """
    Audit trail for every SMS attempt.
    Logs success/failure and any error messages from Twilio.
    """
    __tablename__ = "reminder_logs"

    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=False)
    attempt_time = Column(DateTime, default=datetime.utcnow)
    channel = Column(String(20), default="sms")
    result = Column(String(20), nullable=False)       # success | failure
    error_message = Column(Text, nullable=True)
