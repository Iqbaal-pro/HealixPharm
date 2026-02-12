from datetime import datetime
from app.models.inventory import Inventory
from app.models.batch import MedicineBatch
from app.models.stock_log import StockLog
from sqlalchemy.orm import Session

class StockUpdateService:
    """
    Handles stock deduction using FEFO (First-Expiry-First-Out) logic
    When medicines are issued, deduct from batches expiring earliest first
    """

    def __init__(self, db: Session = None):
        self.db = db

    def update_stock_fefo(
        self,
        db: Session,
        medicine_id: int,
        quantity_to_deduct: int,
        issued_to: int = None,
        reference_type: str = "order",
        staff_id: int = None
    ):
        """
        Deduct stock using FEFO logic
        Get batches ordered by expiry date and deduct from earliest first
        """

        # Validate quantity
        if quantity_to_deduct <= 0:
            raise ValueError("Quantity to deduct must be greater than zero")

        # Get total available stock
        total_available = db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).with_entities(
            db.func.sum(Inventory.quantity_available)
        ).scalar()

        if not total_available or total_available < quantity_to_deduct:
            raise ValueError(
                f"Not enough stock. Available: {total_available}, "
                f"Requested: {quantity_to_deduct}"
            )

        # Get all batches with available stock, ordered by expiry date
        batches_with_stock = db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id,
            Inventory.quantity_available > 0
        ).join(
            MedicineBatch
        ).order_by(
            MedicineBatch.expiry_date.asc()
        ).all()

        deductions = []
        remaining_to_deduct = quantity_to_deduct

        # Deduct from earliest expiry batches
        for inventory in batches_with_stock:
            if remaining_to_deduct <= 0:
                break

            available = inventory.quantity_available
            to_deduct = min(remaining_to_deduct, available)

            # Update inventory
            inventory.quantity_available -= to_deduct
            inventory.last_stock_update = datetime.utcnow()
            db.add(inventory)

            # Log the deduction
            stock_log = StockLog(
                medicine_id=medicine_id,
                batch_id=inventory.batch_id,
                quantity_used=to_deduct,
                reason="sold",
                issued_to=issued_to,
                reference_type=reference_type,
                staff_id=staff_id,
                logged_at=datetime.utcnow()
            )
            db.add(stock_log)

            deductions.append({
                "batch_id": inventory.batch_id,
                "quantity_deducted": to_deduct
            })

            remaining_to_deduct -= to_deduct

        db.commit()
        return deductions

    def update_stock(
        self,
        db: Session,
        medicine_id: int,
        issued_quantity: int,
        issued_to: int = None,
        staff_id: int = None
    ):
        """
        Simple stock update (legacy method)
        Calls FEFO method for consistency
        """
        return self.update_stock_fefo(
            db,
            medicine_id,
            issued_quantity,
            issued_to,
            "legacy",
            staff_id
        )

    def validate_stock_availability(
        self,
        db: Session,
        medicine_id: int,
        required_quantity: int
    ) -> bool:
        """
        Check if enough stock is available for a medicine
        """
        total_available = db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).with_entities(
            db.func.sum(Inventory.quantity_available)
        ).scalar()

        return total_available >= required_quantity if total_available else False


class StockLogService:

    def create_log(self, medicine_id, quantity_used):
        """
        Create a stock usage log entry
        Use StockUpdateService.update_stock_fefo() for better batch tracking
        """

        # Validate medicine ID
        if medicine_id is None:
            raise ValueError("Medicine ID is required to create stock log")

        # Validate quantity used
        if quantity_used <= 0:
            raise ValueError("Quantity used must be greater than zero")

        # Create StockLog object
        stock_log = StockLog(
            medicine_id=medicine_id,
            quantity_used=quantity_used
        )

        # Return log object (saving is done by repository)
        return stock_log

