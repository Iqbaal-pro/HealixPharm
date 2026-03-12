from datetime import datetime
from sqlalchemy.orm import Session
from app.models.stock_adjustment import StockAdjustment
from app.models.inventory import Inventory
from app.models.stock_log import StockLog

class StockAdjustmentService:
    """
    Handles stock adjustments for:
    - Damaged medicines
    - Expired medicines write-off
    - Waste management
    - Stock corrections (discrepancies)
    - Returned medicines
    """

    def __init__(self, db: Session):
        self.db = db

    def adjust_stock_damaged(
        self,
        medicine_id: int,
        batch_id: int,
        quantity: int,
        staff_id: int,
        reason: str = None
    ):
        """
        Mark medicines as damaged and remove from available stock
        """
        return self._process_adjustment(
            medicine_id,
            batch_id,
            quantity,
            "damaged",
            staff_id,
            reason
        )

    def adjust_stock_expired(
        self,
        medicine_id: int,
        batch_id: int,
        quantity: int,
        staff_id: int,
        reason: str = None
    ):
        """
        Write off expired medicines
        """
        return self._process_adjustment(
            medicine_id,
            batch_id,
            quantity,
            "expired",
            staff_id,
            reason
        )

    def adjust_stock_waste(
        self,
        medicine_id: int,
        batch_id: int,
        quantity: int,
        staff_id: int,
        reason: str = None
    ):
        """
        Record wasted medicine (spillage, contamination, etc)
        """
        return self._process_adjustment(
            medicine_id,
            batch_id,
            quantity,
            "waste",
            staff_id,
            reason
        )

    def adjust_stock_correction(
        self,
        medicine_id: int,
        batch_id: int,
        quantity_adjustment: int,
        staff_id: int,
        reason: str = None
    ):
        """
        Correct inventory discrepancies
        quantity_adjustment can be positive or negative
        """
        return self._process_adjustment(
            medicine_id,
            batch_id,
            abs(quantity_adjustment),
            "correction",
            staff_id,
            reason
        )

    def adjust_stock_returned(
        self,
        medicine_id: int,
        batch_id: int,
        quantity: int,
        staff_id: int,
        reason: str = None
    ):
        """
        Add back returned medicines to stock
        """
        # Get inventory
        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id,
            Inventory.batch_id == batch_id
        ).first()

        if not inventory:
            raise ValueError(f"Inventory not found for medicine {medicine_id}")

        # Increase quantity for returned items
        inventory.quantity_available += quantity
        inventory.last_stock_update = datetime.utcnow()
        self.db.add(inventory)

        # Log the adjustment
        stock_log = StockLog(
            medicine_id=medicine_id,
            batch_id=batch_id,
            quantity_used=-quantity,
            reason="returned",
            staff_id=staff_id,
            logged_at=datetime.utcnow()
        )
        self.db.add(stock_log)

        # Create adjustment record
        adjustment = StockAdjustment(
            medicine_id=medicine_id,
            batch_id=batch_id,
            adjustment_quantity=-quantity,
            adjustment_type="returned",
            reason=reason,
            staff_id=staff_id,
            created_at=datetime.utcnow()
        )
        self.db.add(adjustment)
        self.db.commit()

        return adjustment

    def _process_adjustment(
        self,
        medicine_id: int,
        batch_id: int,
        quantity: int,
        adjustment_type: str,
        staff_id: int,
        reason: str = None
    ):
        """
        Common logic for processing stock adjustments
        """
        # Get inventory
        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id,
            Inventory.batch_id == batch_id
        ).first()

        if not inventory:
            raise ValueError(f"Inventory not found for medicine {medicine_id}")

        # Validate sufficient quantity
        if adjustment_type in ["damaged", "expired", "waste"]:
            if inventory.quantity_available < quantity:
                raise ValueError(
                    f"Cannot adjust {quantity}. "
                    f"Only {inventory.quantity_available} available"
                )

        # Update inventory based on adjustment type
        if adjustment_type in ["damaged", "expired", "waste"]:
            inventory.quantity_available -= quantity

            if adjustment_type == "damaged":
                inventory.quantity_damaged += quantity
            elif adjustment_type == "expired":
                inventory.quantity_expired += quantity

        inventory.last_stock_update = datetime.utcnow()
        self.db.add(inventory)

        # Create stock log entry
        stock_log = StockLog(
            medicine_id=medicine_id,
            batch_id=batch_id,
            quantity_used=quantity,
            reason=adjustment_type,
            staff_id=staff_id,
            logged_at=datetime.utcnow()
        )
        self.db.add(stock_log)

        # Create adjustment record
        adjustment = StockAdjustment(
            medicine_id=medicine_id,
            batch_id=batch_id,
            adjustment_quantity=quantity,
            adjustment_type=adjustment_type,
            reason=reason,
            staff_id=staff_id,
            created_at=datetime.utcnow()
        )
        self.db.add(adjustment)
        self.db.commit()

        return adjustment

    def approve_adjustment(self, adjustment_id: int, approved_by: int):
        """
        Approve a stock adjustment by manager
        """
        adjustment = self.db.query(StockAdjustment).filter(
            StockAdjustment.id == adjustment_id
        ).first()

        if not adjustment:
            raise ValueError("Adjustment not found")

        adjustment.approved_by = approved_by
        adjustment.approved_at = datetime.utcnow()
        self.db.add(adjustment)
        self.db.commit()

        return adjustment

    def get_adjustment_history(self, medicine_id: int = None, batch_id: int = None):
        """
        Get adjustment history with optional filters
        """
        query = self.db.query(StockAdjustment)

        if medicine_id:
            query = query.filter(StockAdjustment.medicine_id == medicine_id)

        if batch_id:
            query = query.filter(StockAdjustment.batch_id == batch_id)

        return query.order_by(StockAdjustment.created_at.desc()).all()
