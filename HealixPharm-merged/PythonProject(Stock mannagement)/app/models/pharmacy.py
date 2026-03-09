from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, text

from app.database.user_base import UserBase


class Pharmacy(UserBase):
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
    prescription_policy = Column(Text, nullable=True)
    refund_policy = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
