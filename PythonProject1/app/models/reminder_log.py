from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base
from datetime import datetime, timezone


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)

    # Make reminder_time timezone-aware (UTC) by default
    reminder_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String, default="pending")  # pending / sent / failed
