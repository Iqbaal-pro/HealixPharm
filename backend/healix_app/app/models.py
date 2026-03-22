from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import logging
from datetime import datetime  #SupportTicket
from app.db import Base
from app.utils.encryption import encrypt_data, decrypt_data

logger = logging.getLogger(__name__)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column("user_id", Integer, ForeignKey("patients.id"), nullable=True)
    agent_id = Column(String(50), nullable=True)  # Name or ID of the pharmacy agent
    status = Column(String(50), default="WAITING")  # WAITING, ACTIVE, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)  # using datetime.utcnow
    accepted_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="support_tickets")
    messages = relationship("SupportMessage", back_populates="ticket")


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    sender_type = Column(String(20))  # USER or AGENT
    body = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)  # using datetime.utcnow

    ticket = relationship("SupportTicket", back_populates="messages")

def _safe_decrypt(cipher_text, field_name: str):
    """Attempt decryption; log a warning and return None on failure."""
    try:
        return decrypt_data(cipher_text)
    except Exception as e:
        logger.warning(f"[Patient] Decryption failed for field '{field_name}': {e}")
        return None

class Patient(Base):
    """
    Stores patient information for reminder/consent management.
    Sensitive data (name, phone, DOB) is encrypted in the database.
    """
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Internal (encrypted) columns mapped to the database
    _name = Column("name", String(600), nullable=True)
    _phone_number = Column("phone_number", String(600), unique=True, index=True, nullable=False)
    _language = Column("language", String(600), nullable=True)
    _date_of_birth = Column("date_of_birth", String(600), nullable=True)
    
    consent = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # --- name ---
    @property
    def name(self) -> str:
        return _safe_decrypt(self._name, "name")

    @name.setter
    def name(self, value: str):
        self._name = encrypt_data(value)

    # --- phone_number ---
    @property
    def phone_number(self) -> str:
        return _safe_decrypt(self._phone_number, "phone_number")

    @phone_number.setter
    def phone_number(self, value: str):
        self._phone_number = encrypt_data(value)

    # --- language ---
    @property
    def language(self) -> str:
        """Hybrid: Decrypt if encrypted (starts with gAAAAA), else return raw."""
        val = self._language
        if val and isinstance(val, str) and val.startswith("gAAAAA"):
            return _safe_decrypt(val, "language") or val
        return val

    @language.setter
    def language(self, value: str):
        """Store language as plain text (e.g., 'en', 'si', 'ta')."""
        self._language = value

    # --- date_of_birth ---
    @property
    def date_of_birth(self) -> str:
        return _safe_decrypt(self._date_of_birth, "date_of_birth")

    @date_of_birth.setter
    def date_of_birth(self, value: str):
        self._date_of_birth = encrypt_data(value)

    orders = relationship("Order", back_populates="patient")
    support_tickets = relationship("SupportTicket", back_populates="patient")


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
    patient_id = Column("user_id", Integer, ForeignKey("patients.id"), nullable=False)
    
    # Fulfillment & Payment Fields
    total_amount = Column(Float, nullable=True)
    payment_method = Column(String(50), nullable=True) # COD, ONLINE
    payment_provider = Column(String(50), nullable=True) # e.g., PAYHERE
    payment_status = Column(String(50), default="PENDING")
    payment_reference = Column(String(255), nullable=True)
    paid_amount = Column(Float, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    reminder_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    prescription = relationship("Prescription", back_populates="order", uselist=False)
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    medicine_id = Column(Integer, nullable=False) # Refers to MySQL Stock ID
    medicine_name = Column(String(255))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String(128), unique=True, index=True, nullable=True) # Now nullable to match MySQL
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True) # Now nullable to match MySQL
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(Integer, nullable=False) # Refers to MySQL Stock ID
    staff_id = Column(Integer, nullable=False) # Refers to internal staff ID
    uploaded_by_staff_id = Column(Integer, nullable=False)
    medicine_name = Column(String(100), nullable=True)
    dose_per_day = Column(Integer, default=1)
    quantity_given = Column(Integer, default=0)
    s3_key = Column(String(512), nullable=True)
    s3_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="prescription")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pharmacy_name = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=True)
    whatsapp_number = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    opening_hours = Column(Text, nullable=True)
    estimated_delivery_time = Column(String(50), nullable=True)
    service_areas = Column(String(100), nullable=True)
    service_charge = Column(Float, nullable=True)
    prescription_policy = Column(Text, nullable=True)
    refund_policy = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PharmacySetting(Base):
    __tablename__ = "pharmacy_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)


class DeliverySetting(Base):
    __tablename__ = "delivery_settings"

    id = Column(Integer, primary_key=True, index=True)
    area = Column(String(255), unique=True, index=True, nullable=False)
    charge = Column(Float, nullable=False)
    estimated_time = Column(String(100), nullable=True)


class PolicySetting(Base):
    __tablename__ = "policy_settings"

    id = Column(Integer, primary_key=True, index=True)
    policy_type = Column(String(100), unique=True, index=True, nullable=False) # e.g., 'prescription', 'refund'
    content = Column(Text, nullable=False)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    provider = Column(String(50), default="PAYHERE")
    status = Column(String(50)) # PENDING, PAID, FAILED, INVALID
    reference = Column(String(255), nullable=True)
    amount = Column(Float)
    ipn_payload = Column(Text, nullable=True) # Store raw payload for audit
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="payments")

