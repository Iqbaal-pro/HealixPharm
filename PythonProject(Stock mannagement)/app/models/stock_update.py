from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.database.base import Base


class StockUpdate(Base):
    """
    Represents a stock addition event (history)
    """

    __tablename__ = "stock_updates"

    id = Column(Integer, primary_key=True)

    # Which medicine stock was updated
    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id"),
        nullable=False
    )

    # How much stock was added
    quantity_added = Column(Integer, nullable=False)

    # Supplier who provided the stock
    supplier_name = Column(String(100))

    # Staff member who accepted the stock
    staff_id = Column(Integer, nullable=False)

    # Date & time of stock update
    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )
