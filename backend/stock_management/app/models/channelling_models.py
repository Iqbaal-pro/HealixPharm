from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(255), nullable=False)
    specialization  = Column(String(255), nullable=False)
    hospital        = Column(String(255), nullable=False)
    qualifications  = Column(String(500), nullable=True)
    experience      = Column(String(100), nullable=True)
    fee             = Column(Float, nullable=False, default=0)
    initials        = Column(String(10), nullable=True)
    available       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    other_hospitals = relationship("OtherHospital", back_populates="doctor", cascade="all, delete")
    time_slots      = relationship("TimeSlot", back_populates="doctor", cascade="all, delete")


class OtherHospital(Base):
    __tablename__ = "other_hospitals"

    id         = Column(Integer, primary_key=True, index=True)
    doctor_id  = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    name       = Column(String(255), nullable=False)
    days       = Column(String(255), nullable=True)
    hours      = Column(String(100), nullable=True)

    doctor     = relationship("Doctor", back_populates="other_hospitals")
    time_slots = relationship("TimeSlot", back_populates="other_hospital")


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id                = Column(Integer, primary_key=True, index=True)
    doctor_id         = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    other_hospital_id = Column(Integer, ForeignKey("other_hospitals.id"), nullable=True)
    hospital_name     = Column(String(255), nullable=False)
    time              = Column(String(20), nullable=False)
    date              = Column(String(20), nullable=False)
    booked            = Column(Boolean, default=False)

    doctor         = relationship("Doctor", back_populates="time_slots")
    other_hospital = relationship("OtherHospital", back_populates="time_slots")


class ChannellingPatient(Base):
    __tablename__ = "channelling_patients"

    id           = Column(Integer, primary_key=True, index=True)
    full_name    = Column(String(255), nullable=False)
    id_type      = Column(String(20), nullable=False)
    id_number    = Column(String(100), nullable=False, index=True)
    email        = Column(String(255), nullable=True)
    phone        = Column(String(64), nullable=False)
    address      = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("ChannellingAppointment", back_populates="patient")


class ChannellingAppointment(Base):
    __tablename__ = "channelling_appointments"

    id               = Column(Integer, primary_key=True, index=True)
    booking_ref      = Column(String(64), unique=True, index=True, nullable=False)
    payhere_order_id = Column(String(128), unique=True, nullable=True, index=True)
    doctor_id        = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_id       = Column(Integer, ForeignKey("channelling_patients.id"), nullable=False)
    hospital         = Column(String(255), nullable=False)
    slot_time        = Column(String(20), nullable=False)
    date             = Column(String(20), nullable=False)
    consultation_fee = Column(Float, nullable=False)
    service_fee      = Column(Float, nullable=False, default=0)
    total_fee        = Column(Float, nullable=False)
    notes            = Column(Text, nullable=True)
    status           = Column(
                         Enum("PENDING_PAYMENT", "CONFIRMED", "CANCELLED",
                              name="channelling_appt_status"),
                         default="PENDING_PAYMENT", nullable=False
                       )
    whatsapp_sent    = Column(Boolean, default=False)
    sms_sent         = Column(Boolean, default=False)
    email_sent       = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    doctor  = relationship("Doctor")
    patient = relationship("ChannellingPatient", back_populates="appointments")
