
from app.models.stock_update import StockUpdate


class StockAddService:
    """
    Business logic for adding new stock
    """

    def __init__(self, inventory_repo, stock_update_repo):
        self.inventory_repo = inventory_repo
        self.stock_update_repo = stock_update_repo

    def add_stock(
        self,
        inventory,
        quantity_added: int,
        supplier_name: str,
        staff_id: int
    ):
        """
        Adds new stock and saves update history
        """

        # Increase current stock quantity
        inventory.quantity_available += quantity_added

        # Save inventory update
        self.inventory_repo.update(inventory)

        # Create stock update history record
        stock_update = StockUpdate(
            medicine_id=inventory.medicine_id,
            quantity_added=quantity_added,
            supplier_name=supplier_name,
            staff_id=staff_id
        )

        # Save history
        self.stock_update_repo.add(stock_update)

        return inventory
