from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from datetime import datetime
from app.database.base import Base

class StockLog(Base):
    __tablename__ = "stock_logs"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=False)
    
    # Quantity changes tracking
    quantity_used = Column(Integer, nullable=False)
    
    # Track the reason for stock usage
    # Possible values: sold, damage, expired, adjustment, returned
    reason = Column(String(50), nullable=False, default="sold")
    
    # Link to order or prescription if applicable
    issued_to = Column(Integer, nullable=True)
    reference_type = Column(String(20), nullable=True)
    
    # Timestamp
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    # Staff member who performed action
    staff_id = Column(Integer, nullable=True)
