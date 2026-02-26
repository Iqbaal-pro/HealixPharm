from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    uploaded_by_staff_id = Column(Integer, nullable=False)

    # for reminders
    medicine_name = Column(String, nullable=False)
    dose_quantity = Column(Integer, nullable=False)
    interval_hours = Column(Integer, nullable=False)
    meal_timing = Column(String, nullable=False)
