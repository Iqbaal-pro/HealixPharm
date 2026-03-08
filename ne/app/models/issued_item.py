from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database.declarative_base import Base
from datetime import datetime, timezone


class IssuedItem(Base):
    """
    Merged IssuedItem model.
    - [Refill Reminders] fields: medicine_name, issued_at, reason
    - [Dose Reminders] fields: medicine_id
    - [Refill Reminders + Dose Reminders] fields: prescription_id, quantity_issued
    Table name unified to 'issued_items'.
    """
    __tablename__ = "issued_items"

    id = Column(Integer, primary_key=True, index=True)

    # [Refill Reminders + Dose Reminders]
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)

    # [Refill Reminders]
    medicine_name = Column(String(255), nullable=True)

    # [Dose Reminders]
    medicine_id = Column(Integer, nullable=True)

    # [Refill Reminders + Dose Reminders]
    quantity_issued = Column(Integer, nullable=False)

    # [Refill Reminders] — UTC-aware timestamp of when item was issued
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # [Refill Reminders]
    reason = Column(String(255), nullable=True)
