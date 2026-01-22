from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from app.database.base import Base

class StockLog(Base):
    __tablename__ = "stock_logs"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity_used = Column(Integer, nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnowalch)
