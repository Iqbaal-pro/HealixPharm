from app.models.inventory import Inventory

class InventoryRepository:

    def __init__(self, db):
        self.db = db

    def get_by_medicine_id(self, medicine_id):
        return self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

    def update(self, inventory):
        self.db.add(inventory)
        self.db.commit()
        self.db.refresh(inventory)
        return inventory

    def get_by_medname(self,name):
        return not self.db.query(Inventory).filter(
            Inventory.medicine_name == name
        ).first()

    def get_all(self):
        return self.db.query(Inventory).all()

    def get_low_stock(self):
        return self.db.query(Inventory).filter(
            Inventory.quantity_available <= Inventory.reorder_level
        ).all()

    def get_low_stocks(self):
        return self.get_low_stock()
