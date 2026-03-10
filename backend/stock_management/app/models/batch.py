from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean
from datetime import datetime
from app.database.base import Base

class MedicineBatch(Base):
    __tablename__ = "medicine_batches"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    
    # Batch identification
    batch_number = Column(String(50), nullable=False)
    supplier_id = Column(Integer, nullable=True)
    
    # Batch details
    manufacture_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    
    # Pricing for this batch
    cost_price = Column(Float, nullable=False)
    
    # Dates for tracking
    received_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    is_expired = Column(Boolean, default=False)
