class StockUpdateService:

    def update_stock(self, inventory, issued_quantity):
        """
        Reduce stock after issuing medicine
        """

        # 1. Validate issued quantity
        if issued_quantity <= 0:
            raise ValueError("Issued quantity must be greater than zero")

        # 2. Check if enough stock is available
        if inventory.quantity_available < issued_quantity:
            raise ValueError("Not enough stock available")

        # 3. Reduce stock
        inventory.quantity_available = (
            inventory.quantity_available - issued_quantity
        )

        # 4. Return updated inventory object
        return inventory
