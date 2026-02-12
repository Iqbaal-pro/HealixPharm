from datetime import datetime
from sqlalchemy.orm import Session
from app.models.batch import MedicineBatch
from app.models.inventory import Inventory
from app.models.medicine import Medicine

class BatchManagementService:
    """
    Manages medicine batches including:
    - Creating new batches
    - Marking as expired
    - Tracking batch expiry
    - Batch inventory initialization
    """

    def __init__(self, db: Session):
        self.db = db

    def create_batch(
        self,
        medicine_id: int,
        batch_number: str,
        manufacture_date: datetime,
        expiry_date: datetime,
        cost_price: float,
        supplier_id: int = None,
        quantity_received: int = 0
    ):
        """
        Create a new batch and initialize inventory for it
        """
        # Validate medicine exists
        medicine = self.db.query(Medicine).filter(
            Medicine.id == medicine_id
        ).first()

        if not medicine:
            raise ValueError(f"Medicine {medicine_id} not found")

        # Check if batch already exists
        existing = self.db.query(MedicineBatch).filter(
            MedicineBatch.batch_number == batch_number,
            MedicineBatch.medicine_id == medicine_id
        ).first()

        if existing:
            raise ValueError(f"Batch {batch_number} already exists for this medicine")

        # Create batch
        batch = MedicineBatch(
            medicine_id=medicine_id,
            batch_number=batch_number,
            manufacture_date=manufacture_date,
            expiry_date=expiry_date,
            cost_price=cost_price,
            supplier_id=supplier_id,
            received_date=datetime.utcnow(),
            is_active=True,
            is_expired=False
        )
        self.db.add(batch)
        self.db.flush()

        # Create inventory entry for batch
        inventory = Inventory(
            medicine_id=medicine_id,
            batch_id=batch.id,
            quantity_available=quantity_received,
            quantity_reserved=0,
            quantity_damaged=0,
            quantity_expired=0,
            reorder_level=medicine.minimum_stock_threshold,
            reorder_quantity=50,
            last_stock_update=datetime.utcnow()
        )
        self.db.add(inventory)
        self.db.commit()

        return batch

    def check_and_mark_expired_batches(self):
        """
        Scan all batches and mark as expired if past expiry date
        """
        current_time = datetime.utcnow()

        expired_batches = self.db.query(MedicineBatch).filter(
            MedicineBatch.is_expired == False,
            MedicineBatch.expiry_date <= current_time
        ).all()

        for batch in expired_batches:
            batch.is_expired = True
            self.db.add(batch)

            # Get associated inventory and mark as expired
            inventory = self.db.query(Inventory).filter(
                Inventory.batch_id == batch.id
            ).first()

            if inventory:
                inventory.quantity_expired += inventory.quantity_available
                inventory.quantity_available = 0
                self.db.add(inventory)

        self.db.commit()
        return len(expired_batches)

    def get_batch_details(self, batch_id: int):
        """
        Get detailed information about a batch including inventory
        """
        batch = self.db.query(MedicineBatch).filter(
            MedicineBatch.id == batch_id
        ).first()

        if not batch:
            raise ValueError(f"Batch {batch_id} not found")

        inventory = self.db.query(Inventory).filter(
            Inventory.batch_id == batch_id
        ).first()

        return {
            "batch": batch,
            "inventory": inventory,
            "total_quantity": (
                inventory.quantity_available +
                inventory.quantity_reserved +
                inventory.quantity_damaged +
                inventory.quantity_expired
            ) if inventory else 0
        }

    def get_batches_expiring_soon(self, days: int = 30):
        """
        Get all batches expiring within specified days
        """
        from datetime import timedelta

        threshold = datetime.utcnow() + timedelta(days=days)

        batches = self.db.query(MedicineBatch).filter(
            MedicineBatch.expiry_date <= threshold,
            MedicineBatch.expiry_date > datetime.utcnow(),
            MedicineBatch.is_expired == False
        ).order_by(
            MedicineBatch.expiry_date.asc()
        ).all()

        return batches

    def get_medicine_batches(self, medicine_id: int, include_expired: bool = False):
        """
        Get all batches for a medicine
        """
        query = self.db.query(MedicineBatch).filter(
            MedicineBatch.medicine_id == medicine_id
        )

        if not include_expired:
            query = query.filter(MedicineBatch.is_expired == False)

        return query.order_by(
            MedicineBatch.expiry_date.asc()
        ).all()

    def deactivate_batch(self, batch_id: int, reason: str = None):
        """
        Deactivate a batch (stop using it for new orders)
        """
        batch = self.db.query(MedicineBatch).filter(
            MedicineBatch.id == batch_id
        ).first()

        if not batch:
            raise ValueError(f"Batch {batch_id} not found")

        batch.is_active = False
        self.db.add(batch)
        self.db.commit()

        return batch

    def get_batch_by_number(self, batch_number: str, medicine_id: int = None):
        """
        Find batch by batch number
        """
        query = self.db.query(MedicineBatch).filter(
            MedicineBatch.batch_number == batch_number
        )

        if medicine_id:
            query = query.filter(MedicineBatch.medicine_id == medicine_id)

        return query.first()
