from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.declarative_base import Base
from datetime import datetime, timezone


class Reminder(Base):
    """
    Merged Reminder model covering both dose and refill reminders.
    - [Refill Reminders] fields: status (pending/sent/failed), reminder_time (UTC-aware)
    - [Dose Reminders] fields: medicine_name, dose_quantity, meal_timing
    - [Refill Reminders + Dose Reminders] fields: prescription_id, reminder_time, status
    Dose-specific fields are nullable so refill reminders can omit them.
    """
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)

    # [Refill Reminders + Dose Reminders]
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)

    # Relationships
    prescription = relationship("Prescription", backref="reminders")

    # [Dose Reminders] — name of the medicine for this dose
    medicine_name = Column(String(255), nullable=True)

    # [Dose Reminders] — how many units per dose
    dose_quantity = Column(Integer, nullable=True)

    # [Dose Reminders] — e.g. "before meal", "after meal"
    meal_timing = Column(String(255), nullable=True)

    # [Refill Reminders + Dose Reminders] — when the reminder fires (UTC-aware by default)
    reminder_time = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # [Refill Reminders + Dose Reminders] — pending / sent / failed
    status = Column(String(255), default="pending")
