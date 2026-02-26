from app.models.issued_item import IssuedItem

class IssuedItemRepository:
    def __init__(self, db):
        self.db = db

    def get_by_prescription_id(self, prescription_id: int):
        return (
            self.db.query(IssuedItem)
            .filter(IssuedItem.prescription_id == prescription_id)
            .all()
        )
