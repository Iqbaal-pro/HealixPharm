
from datetime import datetime
from app.models.stock_update import StockUpdate
from app.models.inventory import Inventory
from app.models.batch import MedicineBatch
from sqlalchemy.orm import Session

class StockAddService:
    """
    Business logic for adding new stock with batch tracking
    """

    def __init__(self, inventory_repo, stock_update_repo):
        self.inventory_repo = inventory_repo
        self.stock_update_repo = stock_update_repo

    def add_stock(
        self,
        medicine_id: int,
        batch_id: int,
        batch_number: str,
        expiry_date: datetime,
        quantity_added: int,
        cost_price: float,
        supplier_id: int,
        supplier_name: str,
        staff_id: int,
        db: Session
    ):
        """
        Add new stock to inventory with batch information
        """

        # Validate batch exists
        batch = db.query(MedicineBatch).filter(
            MedicineBatch.id == batch_id
        ).first()

        if not batch:
            raise ValueError(f"Batch {batch_id} not found")

        # Get or create inventory for this batch
        inventory = db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id,
            Inventory.batch_id == batch_id
        ).first()

        if not inventory:
            # If inventory doesn't exist, create it
            inventory = Inventory(
                medicine_id=medicine_id,
                batch_id=batch_id,
                quantity_available=quantity_added,
                quantity_reserved=0,
                quantity_damaged=0,
                quantity_expired=0
            )
        else:
            # Increase current stock quantity
            inventory.quantity_available += quantity_added

        inventory.last_stock_update = datetime.utcnow()

        # Save inventory update
        self.inventory_repo.update(inventory)

        # Create stock update history record with batch information
        stock_update = StockUpdate(
            medicine_id=medicine_id,
            batch_id=batch_id,
            batch_number=batch_number,
            expiry_date=expiry_date,
            quantity_added=quantity_added,
            cost_price=cost_price,
            total_cost=cost_price * quantity_added,
            supplier_id=supplier_id,
            supplier_name=supplier_name,
            staff_id=staff_id,
            date_received=datetime.utcnow()
        )

        # Save history
        self.stock_update_repo.add(stock_update)

        return inventory
