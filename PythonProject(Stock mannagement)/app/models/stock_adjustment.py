from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from datetime import datetime
from app.database.base import Base

class StockAdjustment(Base):
    """
    Tracks stock adjustments for damage, waste, expired medicines, and corrections
    """

    __tablename__ = "stock_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Medicine and batch reference
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=False)
    
    # Adjustment details
    adjustment_quantity = Column(Integer, nullable=False)
    
    # Type of adjustment: expired, damaged, waste, correction, returned
    adjustment_type = Column(String(50), nullable=False)
    
    # Reason for adjustment
    reason = Column(Text, nullable=True)
    
    # Financial impact
    cost_impact = Column(Integer, nullable=True)
    
    # Who made the adjustment
    staff_id = Column(Integer, nullable=False)
    
    # Approval tracking
    approved_by = Column(Integer, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
