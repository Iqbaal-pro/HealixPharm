from sqlalchemy.orm import Session
from app.models.issued_item import IssuedItem


class IssuedItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_prescription(self, prescription_id: int):
        # [Refill Reminders] — retrieve all issued items for a prescription (batch refill check)
        return (
            self.db.query(IssuedItem)
            .filter(IssuedItem.prescription_id == prescription_id)
            .all()
        )

    def get_by_prescription_id(self, prescription_id: int):
        # [Dose Reminders] — alias for get_by_prescription, used by dose reminder creation flow
        return self.get_by_prescription(prescription_id)

    def total_issued_quantity(self, prescription_id: int):
        # [Refill Reminders] — sum of all issued quantities for a prescription (used in refill calc)
        items = self.get_by_prescription(prescription_id)
        return sum(item.quantity_issued for item in items)
