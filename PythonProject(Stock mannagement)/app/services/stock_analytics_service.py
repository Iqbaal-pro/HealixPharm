from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.stock_log import StockLog
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.stock_update import StockUpdate

class StockAnalyticsService:
    """
    Provides stock data aggregation and analytics for AI engine
    Tracks demand, turnover, trends, and forecasting insights
    """

    def __init__(self, db: Session):
        self.db = db

    def get_medicine_consumption_history(
        self,
        medicine_id: int,
        days: int = 90
    ):
        """
        Get consumption history for a medicine over specified days
        """
        date_threshold = datetime.utcnow() - timedelta(days=days)

        consumption = self.db.query(
            func.date(StockLog.logged_at).label("date"),
            func.sum(StockLog.quantity_used).label("quantity_used")
        ).filter(
            StockLog.medicine_id == medicine_id,
            StockLog.reason == "sold",
            StockLog.logged_at >= date_threshold
        ).group_by(
            func.date(StockLog.logged_at)
        ).order_by(
            "date"
        ).all()

        return consumption

    def get_daily_average_consumption(
        self,
        medicine_id: int,
        days: int = 30
    ):
        """
        Calculate average daily consumption
        """
        consumption_history = self.get_medicine_consumption_history(medicine_id, days)

        if not consumption_history:
            return 0

        total_consumed = sum([c.quantity_used for c in consumption_history])
        average = total_consumed / days

        return round(average, 2)

    def get_high_demand_medicines(self, limit: int = 10):
        """
        Get medicines with highest consumption in last 30 days
        """
        date_threshold = datetime.utcnow() - timedelta(days=30)

        high_demand = self.db.query(
            Medicine.id,
            Medicine.name,
            func.sum(StockLog.quantity_used).label("total_consumed")
        ).join(
            StockLog
        ).filter(
            StockLog.reason == "sold",
            StockLog.logged_at >= date_threshold
        ).group_by(
            Medicine.id,
            Medicine.name
        ).order_by(
            func.sum(StockLog.quantity_used).desc()
        ).limit(limit).all()

        return high_demand

    def get_slow_moving_medicines(self, days: int = 90):
        """
        Get medicines never or rarely dispensed in specified period
        """
        date_threshold = datetime.utcnow() - timedelta(days=days)

        slow_moving = self.db.query(
            Medicine.id,
            Medicine.name,
            Inventory.quantity_available,
            func.coalesce(
                func.sum(StockLog.quantity_used), 0
            ).label("times_dispensed")
        ).join(
            Inventory
        ).outerjoin(
            StockLog
        ).filter(
            StockLog.logged_at >= date_threshold
        ).group_by(
            Medicine.id,
            Medicine.name,
            Inventory.quantity_available
        ).having(
            func.coalesce(func.sum(StockLog.quantity_used), 0) < 5
        ).all()

        return slow_moving

    def get_stockout_analysis(self, days: int = 90):
        """
        Analyze stockout events (when quantity fell to zero)
        """
        date_threshold = datetime.utcnow() - timedelta(days=days)

        stockouts = self.db.query(
            Medicine.id,
            Medicine.name,
            func.count(StockLog.id).label("stockout_events")
        ).join(
            StockLog
        ).filter(
            StockLog.logged_at >= date_threshold
        ).group_by(
            Medicine.id,
            Medicine.name
        ).having(
            func.count(StockLog.id) > 5
        ).order_by(
            func.count(StockLog.id).desc()
        ).all()

        return stockouts

    def calculate_inventory_turnover_ratio(self, medicine_id: int):
        """
        Calculate inventory turnover
        Formula: Cost of Goods Sold / Average Inventory Value
        """
        consumptions = self.get_medicine_consumption_history(medicine_id, 365)
        total_consumed = sum([c.quantity_used for c in consumptions])

        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

        if not inventory or inventory.quantity_available == 0:
            return 0

        turnover = total_consumed / inventory.quantity_available
        return round(turnover, 2)

    def get_reorder_recommendations(self):
        """
        Recommend medicines that should be reordered soon
        Based on current stock and average consumption
        """
        medicines = self.db.query(Medicine).filter(
            Medicine.is_active == True
        ).all()

        recommendations = []

        for medicine in medicines:
            avg_daily = self.get_daily_average_consumption(medicine.id, 30)
            inventory = self.db.query(Inventory).filter(
                Inventory.medicine_id == medicine.id
            ).first()

            if not inventory:
                continue

            # Estimate days of stock remaining
            if avg_daily > 0:
                days_remaining = inventory.quantity_available / avg_daily
            else:
                days_remaining = float('inf')

            # Recommend if less than 7 days of stock
            if days_remaining < 7:
                recommendations.append({
                    "medicine_id": medicine.id,
                    "medicine_name": medicine.name,
                    "current_quantity": inventory.quantity_available,
                    "daily_average": avg_daily,
                    "days_remaining": round(days_remaining, 1),
                    "reorder_quantity": medicine.minimum_stock_threshold * 3
                })

        return recommendations

    def get_monthly_consumption_trend(
        self,
        medicine_id: int,
        months: int = 6
    ):
        """
        Get monthly consumption trend for forecasting
        """
        date_threshold = datetime.utcnow() - timedelta(days=30*months)

        trend = self.db.query(
            func.strftime("%Y-%m", StockLog.logged_at).label("month"),
            func.sum(StockLog.quantity_used).label("quantity_used")
        ).filter(
            StockLog.medicine_id == medicine_id,
            StockLog.reason == "sold",
            StockLog.logged_at >= date_threshold
        ).group_by(
            func.strftime("%Y-%m", StockLog.logged_at)
        ).order_by(
            "month"
        ).all()

        return trend

    def export_analytics_data(self, medicine_id: int = None):
        """
        Export aggregated data for analytics and AI processing
        Returns dictionary with all key metrics
        """
        if medicine_id:
            medicine = self.db.query(Medicine).filter(
                Medicine.id == medicine_id
            ).first()

            return {
                "medicine_id": medicine.id,
                "medicine_name": medicine.name,
                "daily_average": self.get_daily_average_consumption(medicine.id, 30),
                "monthly_trend": self.get_monthly_consumption_trend(medicine.id, 6),
                "turnover_ratio": self.calculate_inventory_turnover_ratio(medicine.id),
                "current_inventory": self.db.query(Inventory).filter(
                    Inventory.medicine_id == medicine.id
                ).first(),
                "reorder_recommendations": self.get_reorder_recommendations()
            }
        else:
            return {
                "high_demand_medicines": self.get_high_demand_medicines(),
                "slow_moving_medicines": self.get_slow_moving_medicines(),
                "stockout_analysis": self.get_stockout_analysis(),
                "reorder_recommendations": self.get_reorder_recommendations()
            }
