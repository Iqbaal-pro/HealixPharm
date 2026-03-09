from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.stock_adjustment_service import StockAdjustmentService

router = APIRouter(prefix="/stock-adjustments", tags=["Stock Adjustments"])


class StockAdjustmentRequest(BaseModel):
    medicine_id: int
    batch_id: int
    quantity: int
    staff_id: int
    reason: Optional[str] = None


class StockCorrectionRequest(BaseModel):
    medicine_id: int
    batch_id: int
    quantity_adjustment: int
    staff_id: int
    reason: Optional[str] = None


class ApproveAdjustmentRequest(BaseModel):
    approved_by: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _serialize_adjustment(adjustment):
    return {
        "id": adjustment.id,
        "medicine_id": adjustment.medicine_id,
        "batch_id": adjustment.batch_id,
        "adjustment_quantity": adjustment.adjustment_quantity,
        "adjustment_type": adjustment.adjustment_type,
        "reason": adjustment.reason,
        "staff_id": adjustment.staff_id,
        "approved_by": adjustment.approved_by,
        "approved_at": adjustment.approved_at,
        "created_at": adjustment.created_at,
    }


@router.post("/damaged")
def adjust_damaged(payload: StockAdjustmentRequest, db: Session = Depends(get_db)):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.adjust_stock_damaged(
            payload.medicine_id,
            payload.batch_id,
            payload.quantity,
            payload.staff_id,
            payload.reason,
        )
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/expired")
def adjust_expired(payload: StockAdjustmentRequest, db: Session = Depends(get_db)):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.adjust_stock_expired(
            payload.medicine_id,
            payload.batch_id,
            payload.quantity,
            payload.staff_id,
            payload.reason,
        )
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/waste")
def adjust_waste(payload: StockAdjustmentRequest, db: Session = Depends(get_db)):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.adjust_stock_waste(
            payload.medicine_id,
            payload.batch_id,
            payload.quantity,
            payload.staff_id,
            payload.reason,
        )
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/correction")
def adjust_correction(payload: StockCorrectionRequest, db: Session = Depends(get_db)):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.adjust_stock_correction(
            payload.medicine_id,
            payload.batch_id,
            payload.quantity_adjustment,
            payload.staff_id,
            payload.reason,
        )
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/returned")
def adjust_returned(payload: StockAdjustmentRequest, db: Session = Depends(get_db)):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.adjust_stock_returned(
            payload.medicine_id,
            payload.batch_id,
            payload.quantity,
            payload.staff_id,
            payload.reason,
        )
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{adjustment_id}/approve")
def approve_adjustment(
    adjustment_id: int,
    payload: ApproveAdjustmentRequest,
    db: Session = Depends(get_db),
):
    service = StockAdjustmentService(db)
    try:
        adjustment = service.approve_adjustment(adjustment_id, payload.approved_by)
        return _serialize_adjustment(adjustment)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/history")
def get_adjustment_history(
    medicine_id: Optional[int] = None,
    batch_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    service = StockAdjustmentService(db)
    history = service.get_adjustment_history(medicine_id=medicine_id, batch_id=batch_id)
    return [_serialize_adjustment(item) for item in history]
