import Inventory


class InventoryRepository:
    def __init__(self, db):
        self.db = db

    def get_by_medicine_id(self, medicine_id: int):
        return (
            self.db.query(Inventory)
            .filter(Inventory.medicine_id == medicine_id)
            .first()
        )

    def get_low_stock(self):
        return (
            self.db.query(Inventory)
            .filter(Inventory.quantity_available <= Inventory.reorder_level)
            .all()
        )
