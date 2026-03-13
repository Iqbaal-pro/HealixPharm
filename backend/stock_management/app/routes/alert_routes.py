from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database.db import SessionLocal
from app.services.enhanced_stock_alert_service import EnhancedStockAlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# ─── DB session dependency ──────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── Schemas ────────────────────────────────────────────────────────
class AlertResponse(BaseModel):
    id: int
    medicine_id: int
    batch_id: Optional[int]
    alert_type: str
    current_quantity: float
    threshold_value: float
    is_active: bool
    is_acknowledged: bool
    acknowledged_by: Optional[int]
    acknowledged_at: Optional[datetime]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

class AcknowledgeRequest(BaseModel):
    staff_id: int

# ─── Endpoints ──────────────────────────────────────────────────────

@router.get("/active", response_model=List[AlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    """Get all currently active stock alerts."""
    service = EnhancedStockAlertService(db)
    return service.get_active_alerts()

@router.post("/check", response_model=List[AlertResponse])
def trigger_alert_check(db: Session = Depends(get_db)):
    """Manually trigger a scan of all medicines to generate alerts."""
    service = EnhancedStockAlertService(db)
    return service.check_all_alerts()

@router.get("/check/low-stock/{medicine_id}", response_model=Optional[AlertResponse])
def check_low_stock(medicine_id: int, db: Session = Depends(get_db)):
    service = EnhancedStockAlertService(db)
    return service.check_low_stock_alert(medicine_id)

@router.get("/check/critical-stock/{medicine_id}", response_model=Optional[AlertResponse])
def check_critical_stock(medicine_id: int, db: Session = Depends(get_db)):
    service = EnhancedStockAlertService(db)
    return service.check_critical_stock_alert(medicine_id)

@router.get("/check/expiry/{medicine_id}", response_model=List[AlertResponse])
def check_expiry(medicine_id: int, db: Session = Depends(get_db)):
    service = EnhancedStockAlertService(db)
    return service.check_expiry_alert(medicine_id)

@router.get("/check/overstock/{medicine_id}", response_model=Optional[AlertResponse])
def check_overstock(medicine_id: int, db: Session = Depends(get_db)):
    service = EnhancedStockAlertService(db)
    return service.check_overstock_alert(medicine_id)

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: int, payload: AcknowledgeRequest, db: Session = Depends(get_db)):
    """Acknowledge an alert by a staff member."""
    service = EnhancedStockAlertService(db)
    try:
        return service.acknowledge_alert(alert_id, payload.staff_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved (e.g. after restock)."""
    service = EnhancedStockAlertService(db)
    try:
        return service.resolve_alert(alert_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
