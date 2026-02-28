
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime  #SupportTicket
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(String(50), nullable=True)  # Name or ID of the pharmacy agent
    status = Column(String(50), default="WAITING")  # WAITING, ACTIVE, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)  # using datetime.utcnow
    accepted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="support_tickets")
    messages = relationship("SupportMessage", back_populates="ticket")


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    sender_type = Column(String(20))  # USER or AGENT
    body = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)  # using datetime.utcnow

    ticket = relationship("SupportTicket", back_populates="messages")
    
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(64), nullable=False, default="PENDING_VERIFICATION")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
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

    user = relationship("User", back_populates="orders")
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
    prescription_id = Column(String(128), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    s3_key = Column(String(512), nullable=False)
    s3_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="prescription")


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
<<<<<<< HEAD


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

class MOHDiseaseAlert(Base):
    __tablename__ = "moh_disease_alerts"

    id = Column(Integer, primary_key=True, index=True)
    disease_name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=False)
    threat_level = Column(String(50), nullable=False) # Low, Medium, High
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="Active") # Active, Expired
    broadcast_sent = Column(Integer, default=0) # 0 or 1
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
=======
>>>>>>> e-channeling-feature
