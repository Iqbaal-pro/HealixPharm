from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    reminder_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending / sent / failed
