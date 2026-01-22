from sqlalchemy import Column, Integer, ForeignKey
from app.database.base import Base

class IssuedItem(Base):
    __tablename__ = "issued_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity_issued = Column(Integer, nullable=False)
