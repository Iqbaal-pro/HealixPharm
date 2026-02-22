from app.models.inventory import Inventory

class InventoryRepository:

    def __init__(self, db):
        self.db = db

    def get_by_medicine_id(self, medicine_id):
        return self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

    def update(self, inventory):
        self.db.commit()
        self.db.refresh(inventory)
        return inventory

    def get_by_medname(self,name):
        return not self.db.query(Inventory).filter(
            Inventory.medicine_name == name
        ).first()
