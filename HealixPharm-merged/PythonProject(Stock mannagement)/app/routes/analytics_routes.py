from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.stock_analytics_service import StockAnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/high-demand")
def get_high_demand(limit: int = 10, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    data = service.get_high_demand_medicines(limit=limit)
    return [
        {
            "medicine_id": row.id,
            "medicine_name": row.name,
            "total_consumed": row.total_consumed,
        }
        for row in data
    ]


@router.get("/reorder-recommendations")
def get_reorder_recommendations(db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    return service.get_reorder_recommendations()


@router.get("/slow-moving")
def get_slow_moving(days: int = 90, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    data = service.get_slow_moving_medicines(days=days)
    return [
        {
            "medicine_id": row.id,
            "medicine_name": row.name,
            "quantity_available": row.quantity_available,
            "times_dispensed": row.times_dispensed,
        }
        for row in data
    ]


@router.get("/stockout-analysis")
def get_stockout_analysis(days: int = 90, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    data = service.get_stockout_analysis(days=days)
    return [
        {
            "medicine_id": row.id,
            "medicine_name": row.name,
            "stockout_events": row.stockout_events,
        }
        for row in data
    ]


@router.get("/medicine/{medicine_id}/daily-average")
def get_daily_average(medicine_id: int, days: int = 30, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    return {
        "medicine_id": medicine_id,
        "days": days,
        "daily_average": service.get_daily_average_consumption(medicine_id, days),
    }


@router.get("/medicine/{medicine_id}/consumption-history")
def get_consumption_history(
    medicine_id: int,
    days: int = 90,
    db: Session = Depends(get_db),
):
    service = StockAnalyticsService(db)
    data = service.get_medicine_consumption_history(medicine_id, days)
    return [
        {
            "date": str(row.date),
            "quantity_used": row.quantity_used,
        }
        for row in data
    ]


@router.get("/medicine/{medicine_id}/monthly-trend")
def get_monthly_trend(medicine_id: int, months: int = 6, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    data = service.get_monthly_consumption_trend(medicine_id, months=months)
    return [
        {
            "month": row.month,
            "quantity_used": row.quantity_used,
        }
        for row in data
    ]


@router.get("/medicine/{medicine_id}/turnover")
def get_turnover_ratio(medicine_id: int, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    return {
        "medicine_id": medicine_id,
        "turnover_ratio": service.calculate_inventory_turnover_ratio(medicine_id),
    }


@router.get("/export")
def export_analytics(medicine_id: int = None, db: Session = Depends(get_db)):
    service = StockAnalyticsService(db)
    try:
        data = service.export_analytics_data(medicine_id=medicine_id)
        if medicine_id is not None and data.get("current_inventory") is not None:
            inventory = data["current_inventory"]
            data["current_inventory"] = {
                "id": inventory.id,
                "medicine_id": inventory.medicine_id,
                "batch_id": inventory.batch_id,
                "quantity_available": inventory.quantity_available,
                "quantity_reserved": inventory.quantity_reserved,
                "quantity_damaged": inventory.quantity_damaged,
                "quantity_expired": inventory.quantity_expired,
                "reorder_level": inventory.reorder_level,
                "reorder_quantity": inventory.reorder_quantity,
                "last_stock_update": inventory.last_stock_update,
            }
        return data
    except AttributeError:
        raise HTTPException(status_code=404, detail="Medicine not found")
