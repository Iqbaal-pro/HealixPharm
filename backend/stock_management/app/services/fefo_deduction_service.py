from datetime import datetime
from sqlalchemy.orm import Session
from app.models.batch import MedicineBatch
from app.models.inventory import Inventory
from app.models.stock_log import StockLog

class FEFODeductionService:
    """
    Implements First-Expiry-First-Out deduction logic
    When medicine is issued, it uses the batch that expires earliest
    """

    def __init__(self, db: Session):
        self.db = db

    def deduct_stock_fefo(
        self,
        medicine_id: int,
        quantity_needed: int,
        issued_to: int = None,
        reference_type: str = "order",
        staff_id: int = None
    ):
        """
        Deduct stock using FEFO logic
        Reduces quantity from batches expiring earliest first
        Returns list of batches used and quantities deducted
        """
        
        # Get all active, non-expired batches for this medicine
        # Order by expiry_date ascending to get earliest expiry first
        batches = self.db.query(
            MedicineBatch
        ).filter(
            MedicineBatch.medicine_id == medicine_id,
            MedicineBatch.is_active == True,
            MedicineBatch.is_expired == False,
            MedicineBatch.expiry_date > datetime.utcnow()
        ).order_by(
            MedicineBatch.expiry_date.asc()
        ).all()

        if not batches:
            raise ValueError(f"No active batches available for medicine {medicine_id}")

        # Track deductions
        deductions = []
        remaining_quantity = quantity_needed

        # Deduct from earliest expiry batches
        for batch in batches:
            if remaining_quantity <= 0:
                break

            # Get inventory for this batch
            inventory = self.db.query(
                Inventory
            ).filter(
                Inventory.medicine_id == medicine_id,
                Inventory.batch_id == batch.id
            ).first()

            if not inventory:
                continue

            # Calculate how much we can take from this batch
            available = inventory.quantity_available
            to_deduct = min(remaining_quantity, available)

            # Update inventory
            inventory.quantity_available -= to_deduct
            inventory.last_stock_update = datetime.utcnow()
            self.db.add(inventory)

            # Log the deduction
            stock_log = StockLog(
                medicine_id=medicine_id,
                batch_id=batch.id,
                quantity_used=to_deduct,
                reason="sold",
                issued_to=issued_to,
                reference_type=reference_type,
                staff_id=staff_id,
                logged_at=datetime.utcnow()
            )
            self.db.add(stock_log)

            # Track what we deducted
            deductions.append({
                "batch_id": batch.id,
                "batch_number": batch.batch_number,
                "expiry_date": batch.expiry_date,
                "quantity_deducted": to_deduct
            })

            remaining_quantity -= to_deduct

        if remaining_quantity > 0:
            raise ValueError(
                f"Not enough stock. Needed {quantity_needed}, "
                f"only could deduct {quantity_needed - remaining_quantity}"
            )

        self.db.commit()
        return deductions

    def validate_stock_available(self, medicine_id: int, quantity_needed: int) -> bool:
        """
        Check if enough stock is available
        """
        total_available = self.db.query(
            (Inventory.quantity_available)
        ).filter(
            Inventory.medicine_id == medicine_id
        ).scalar()

        return total_available >= quantity_needed if total_available else False
