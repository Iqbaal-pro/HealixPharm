from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float
from datetime import datetime
from app.database.base import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    
    # Batch and expiry tracking
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=False)
    
    # Stock quantities with different statuses
    quantity_available = Column(Integer, nullable=False, default=0)
    quantity_reserved = Column(Integer, nullable=False, default=0)
    quantity_damaged = Column(Integer, nullable=False, default=0)
    quantity_expired = Column(Integer, nullable=False, default=0)
    
    # Reorder parameters
    reorder_level = Column(Integer, nullable=False)
    reorder_quantity = Column(Integer, nullable=True)
    
    # Analytics tracking
    turnover_rate = Column(Float, nullable=True)
    last_stock_update = Column(DateTime, default=datetime.utcnow)
    last_dispensed_at = Column(DateTime, nullable=True)
