from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base


class Reminder(Base):
    """
    Tracks scheduled SMS reminders for prescriptions.
    - status: 'pending' → 'sent' after successful SMS
    - one_time: True for pharmacist-triggered one-off reminders
    - channel: always 'sms' for now
    """
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    reminder_time = Column(DateTime, nullable=False)
    channel = Column(String(20), default="sms")
    status = Column(String(20), default="pending")   # pending | sent
    one_time = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
