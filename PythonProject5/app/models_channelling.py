from sqlalchemy import Column, Integer, String, DateTime, Text, func
from app.db_channelling import BaseChannelling

class Doctor(BaseChannelling):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255), nullable=False)
    fee = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Appointment(BaseChannelling):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False) # Plain integer since it's a cross-DB reference
    user_phone = Column(String(64), nullable=False)
    doctor_id = Column(Integer, nullable=False) # Reference to Doctor in the same DB
    doctor_name = Column(String(255), nullable=False)
    specialty = Column(String(255), nullable=False)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    fee = Column(String(64), nullable=False)
    status = Column(String(64), nullable=False, default="PENDING_PAYMENT")
    payhere_order_id = Column(String(128), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
