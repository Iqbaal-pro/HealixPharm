from sqlalchemy.orm import Session
from app.models.stock_update import StockUpdate


class StockUpdateRepository:


    def __init__(self, db: Session):
        self.db = db

    def add(self, stock_update: StockUpdate):
        """
        Save a stock update record
        """
        self.db.add(stock_update)
        self.db.commit()
        self.db.refresh(stock_update)
        return stock_update

    def get_all(self):
        """
        Fetch all stock update history
        """
        return self.db.query(StockUpdate).order_by(
            StockUpdate.updated_at.desc()
        ).all()
