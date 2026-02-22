from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from app.database.base import Base

class IssuedItem(Base):
    __tablename__ = "issued_items"

    id = Column(Integer, primary_key=True, index=True)
    
    # Reference to prescription
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    
    # Medicine and batch that was issued
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=False)
    
    # Quantity issued
    quantity_issued = Column(Integer, nullable=False)
    
    # When it was issued
    issued_at = Column(DateTime, default=datetime.utcnow)
    
    # Track which staff issued this
    issued_by = Column(Integer, nullable=True)
