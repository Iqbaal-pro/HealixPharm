from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    uploaded_by_staff_id = Column(Integer, nullable=False)
