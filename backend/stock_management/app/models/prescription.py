from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base


class Prescription(Base):
    """
    Extended prescription model for the reminder system.
    - dose_per_day: how many doses per day (used for refill calculation)
    - quantity_given: total units dispensed to patient
    - start_date: when the prescription started
    - is_continuous: pharmacist marks this for long-term / recurring meds
    """
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    uploaded_by_staff_id = Column(Integer, nullable=False)

    # Medicine details for reminders
    medicine_name = Column(String(100), nullable=False)
    dose_per_day = Column(Integer, nullable=False, default=1)
    start_date = Column(DateTime, default=datetime.utcnow)
    quantity_given = Column(Integer, nullable=False, default=0)

    # Pharmacist checkbox: long-term / continuous medication
    is_continuous = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
