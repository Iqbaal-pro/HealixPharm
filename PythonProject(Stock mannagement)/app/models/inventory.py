from sqlalchemy import Column, Integer, ForeignKey
from app.database.base import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity_available = Column(Integer, nullable=False)
    reorder_level = Column(Integer, nullable=False)
