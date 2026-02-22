from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from datetime import datetime
from app.database.base import Base


class StockUpdate(Base):
    """
    Tracks all stock addition events with batch information
    """

    __tablename__ = "stock_updates"

    id = Column(Integer, primary_key=True)

    # Medicine reference
    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id"),
        nullable=False
    )

    # Batch reference
    batch_id = Column(
        Integer,
        ForeignKey("medicine_batches.id"),
        nullable=True
    )

    # Batch details (stored for history)
    batch_number = Column(String(50), nullable=False)
    manufacture_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=False)

    # Quantity added
    quantity_added = Column(Integer, nullable=False)

    # Cost information
    cost_price = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)

    # Supplier reference
    supplier_name = Column(String(100), nullable=True)
    supplier_id = Column(Integer, nullable=True)

    # Staff member who accepted stock
    staff_id = Column(Integer, nullable=False)

    # Timestamps
    date_received = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )
