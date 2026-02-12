from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base
from datetime import datetime, timezone


class IssuedItem(Base):
    __tablename__ = "stock_logs"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    quantity_issued = Column(Integer, nullable=False)

    # Make timestamp UTC-aware using lambda
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    reason = Column(String, nullable=True)
