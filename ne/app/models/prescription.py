from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.declarative_base import Base


class Prescription(Base):
    """
    Merged Prescription model.
    - Fields used by BOTH reminders: medicine_name, interval_hours
    - [Refill Reminders] fields: patient_id (FK), dose_per_day, start_time
    - [Dose Reminders] fields: uploaded_by_staff_id, dose_quantity, meal_timing
    Columns that only one system uses are nullable to remain backward-compatible.
    """
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)

    # [Refill Reminders + Dose Reminders]
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)

    # [Dose Reminders]
    uploaded_by_staff_id = Column(Integer, nullable=True)

    # [Refill Reminders + Dose Reminders]
    medicine_name = Column(String(255), nullable=False)

    # [Refill Reminders] — total quantity prescribed
    total_quantity = Column(Integer, nullable=True)

    # [Refill Reminders] — doses per day used in refill quantity calculations
    dose_per_day = Column(Integer, nullable=True)

    # [Dose Reminders] — quantity per single dose (e.g. 1 tablet)
    dose_quantity = Column(Integer, nullable=True)

    # [Refill Reminders + Dose Reminders]
    interval_hours = Column(Integer, nullable=False)

    # [Dose Reminders]
    meal_timing = Column(String(255), nullable=True)

    # [Refill Reminders] — when the prescription started (used for active prescription checks)
    start_time = Column(DateTime, nullable=True)

    # [Dose Reminders] — recurring type and duration
    reminder_type = Column(String(50), nullable=True)  # "time_based" or "meal_based"
    duration_days = Column(Integer, nullable=True)

    # Relationships
    patient = relationship("Patient", backref="prescriptions")
