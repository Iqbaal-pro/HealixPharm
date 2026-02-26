from sqlalchemy import Column, Integer, DateTime, String
from app.database.base import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)

    prescription_id = Column(Integer, nullable=False)

    medicine_name = Column(String, nullable=False)
    dose_quantity = Column(Integer, nullable=False)
    meal_timing = Column(String, nullable=False)

    reminder_time = Column(DateTime, nullable=False)

    status = Column(String, default="pending")  # SMS only
