from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dose_per_day = Column(Integer, nullable=False)
    interval_hours = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
