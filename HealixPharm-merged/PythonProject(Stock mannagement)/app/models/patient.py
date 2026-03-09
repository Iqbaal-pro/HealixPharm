from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database.base import Base


class Patient(Base):
    """
    Stores patient information for reminder/consent management.
    Only patients with consent=True will receive SMS reminders.
    """
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    language = Column(String(10), default="en")  # e.g. "en", "si", "ta"
    consent = Column(Boolean, default=False)      # must be True to send SMS

    created_at = Column(DateTime, default=datetime.utcnow)
