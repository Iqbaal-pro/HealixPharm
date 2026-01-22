from app.models.stock_log import StockLog

class StockLogRepository:

    def __init__(self, db):
        self.db = db

    def create(self, stock_log):
        self.db.add(stock_log)
        self.db.commit()
        self.db.refresh(stock_log)
        return stock_log

    def get_by_medicine_id(self, medicine_id):
        return self.db.query(StockLog).filter(
            StockLog.medicine_id == medicine_id
        ).all()
