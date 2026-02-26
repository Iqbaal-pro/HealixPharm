from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(64), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)


class MOHDiseaseAlert(Base):
    __tablename__ = "moh_disease_alerts"

    id = Column(Integer, primary_key=True, index=True)
    disease_name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=False)
    threat_level = Column(String(64), nullable=False)  # Low, Medium, High
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(64), default="Active")  # Active, Expired
    broadcast_sent = Column(Boolean, default=False)
    retry_count = Column(Integer, default=0)
    last_attempt_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AlertBroadcastLog(Base):
    __tablename__ = "alert_broadcast_log"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("moh_disease_alerts.id"), nullable=False)
    phone_number = Column(String(64), nullable=False)
    send_status = Column(String(64), nullable=False)  # SENT, FAILED
    api_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(64), nullable=False, default="PENDING_VERIFICATION")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    prescription = relationship("Prescription", back_populates="order", uselist=False)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String(128), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    s3_key = Column(String(512), nullable=False)
    s3_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="prescription")
