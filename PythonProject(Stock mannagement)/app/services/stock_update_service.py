from app.models.stock_log import StockLog

class StockLogService:

    def create_log(self, medicine_id, quantity_used):
        """
        Create a stock usage log entry
        """

        # 1. Validate medicine ID
        if medicine_id is None:
            raise ValueError("Medicine ID is required to create stock log")

        # 2. Validate quantity used
        if quantity_used <= 0:
            raise ValueError("Quantity used must be greater than zero")

        # 3. Create StockLog object
        stock_log = StockLog(
            medicine_id=medicine_id,
            quantity_used=quantity_used
        )

        # 4. Return log object (saving is done by repository)
        return stock_log
