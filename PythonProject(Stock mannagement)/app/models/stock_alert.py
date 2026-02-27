from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime
from app.database.base import Base

class StockAlert(Base):
    """
    Tracks stock alerts triggered by system
    Alert types: low_stock, critical_stock, expiry_warning, overstock
    """

    __tablename__ = "stock_alerts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Medicine and batch reference
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=True)
    
    # Alert type
    alert_type = Column(String(50), nullable=False)
    
    # Alert details
    current_quantity = Column(Integer, nullable=False)
    threshold_value = Column(Integer, nullable=False)
    
    # Alert status
    is_active = Column(Boolean, default=True)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
