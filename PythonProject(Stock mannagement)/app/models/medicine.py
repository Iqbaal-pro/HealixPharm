from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database.base import Base

class Medicine(Base):
    __tablename__ = "medicines"

    # Basic identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    sku = Column(String(50), nullable=False, unique=True)
    dosage_form = Column(String(50), nullable=False)
    strength = Column(String(50), nullable=True)
    unit_of_measurement = Column(String(20), nullable=False)
    
    # Pharmaceutical details
    category = Column(String(100), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    registration_number = Column(String(50), nullable=True)
    
    # Pricing information
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    
    # Stock thresholds for alerts
    minimum_stock_threshold = Column(Integer, default=10)
    maximum_stock_level = Column(Integer, nullable=True)
    
    # System tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
