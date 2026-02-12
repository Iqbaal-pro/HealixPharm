from sqlalchemy.orm import Session
from app.models.issued_item import IssuedItem

class IssuedItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_prescription(self, prescription_id: int):
        return self.db.query(IssuedItem).filter(IssuedItem.prescription_id == prescription_id).all()

    def total_issued_quantity(self, prescription_id: int):
        items = self.get_by_prescription(prescription_id)
        return sum(item.quantity_issued for item in items)
