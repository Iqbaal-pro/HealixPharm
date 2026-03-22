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
        Get medicines with highest consumption.
        Fallback: If live database logs are empty, fetch from the historical ML data (CSV).
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

        if not high_demand:
            # Fallback to ML Data CSV if database is empty (Simulate data for the user)
            try:
                import pandas as pd
                import os
                # Get the project root directory
                BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
                csv_path = os.path.join(BASE_DIR, "backend", "stock_management", "Stock_prediction", "data", "preprocessed_12_month_data.csv")
                df = pd.read_csv(csv_path)
                # Aggregate total quantity per item
                top_items = df.groupby('item')['total_qty'].sum().sort_values(ascending=False).head(limit)
                return [type('Obj', (object,), {"id": idx, "name": name, "total_consumed": int(qty)}) 
                        for idx, (name, qty) in enumerate(top_items.items())]
            except:
                return []

        return high_demand

    def get_slow_moving_medicines(self, days: int = 90):
        """
        Get medicines rarely dispensed.
        """
        slow_moving = self.db.query(
            Medicine.id,
            Medicine.name,
            Inventory.quantity_available,
            func.coalesce(func.sum(StockLog.id), 0).label("times_dispensed")
        ).join(Inventory).outerjoin(StockLog).group_by(
            Medicine.id, Medicine.name, Inventory.quantity_available
        ).having(func.count(StockLog.id) < 5).limit(10).all()
        
        return slow_moving

    def get_stockout_analysis(self, days: int = 90):
        """
        Analyze products at 0 stock.
        Improved: Show everything currently at 0 as high risk.
        """
        stockout_items = self.db.query(
            Medicine.id,
            Medicine.name,
            func.count(Inventory.id).label("stockout_events")
        ).join(Inventory).filter(
            Inventory.quantity_available == 0
        ).group_by(Medicine.id, Medicine.name).limit(10).all()

        return stockout_items

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
        Recommend medicines that should be reordered soon.
        Improved logic: checks both predicted days remaining AND database reorder levels.
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

            # Check 1: Live consumption logic (Predicted days remaining)
            if avg_daily > 0:
                days_remaining = inventory.quantity_available / avg_daily
            else:
                days_remaining = float('inf')

            # Check 2: Static reorder level (Database threshold)
            is_below_threshold = inventory.quantity_available <= inventory.reorder_level

            # Recommend if either condition is met
            if days_remaining < 7 or is_below_threshold:
                recommendations.append({
                    "medicine_id": medicine.id,
                    "medicine_name": medicine.name,
                    "current_quantity": inventory.quantity_available,
                    "daily_average": avg_daily,
                    "days_remaining": round(days_remaining, 1) if days_remaining != float('inf') else "N/A",
                    "reorder_quantity": inventory.reorder_quantity or (medicine.minimum_stock_threshold * 3)
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
