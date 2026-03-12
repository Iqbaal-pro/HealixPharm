from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.batch_management_service import BatchManagementService

router = APIRouter(prefix="/batches", tags=["Batches"])


class CreateBatchRequest(BaseModel):
    medicine_id: int
    batch_number: str
    manufacture_date: datetime
    expiry_date: datetime
    cost_price: float
    supplier_id: Optional[int] = None
    quantity_received: int = 0


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _serialize_batch(batch):
    return {
        "id": batch.id,
        "medicine_id": batch.medicine_id,
        "batch_number": batch.batch_number,
        "supplier_id": batch.supplier_id,
        "manufacture_date": batch.manufacture_date,
        "expiry_date": batch.expiry_date,
        "cost_price": batch.cost_price,
        "received_date": batch.received_date,
        "created_at": batch.created_at,
        "is_active": batch.is_active,
        "is_expired": batch.is_expired,
    }


@router.post("/")
def create_batch(payload: CreateBatchRequest, db: Session = Depends(get_db)):
    service = BatchManagementService(db)
    try:
        batch = service.create_batch(
            medicine_id=payload.medicine_id,
            batch_number=payload.batch_number,
            manufacture_date=payload.manufacture_date,
            expiry_date=payload.expiry_date,
            cost_price=payload.cost_price,
            supplier_id=payload.supplier_id,
            quantity_received=payload.quantity_received,
        )
        return _serialize_batch(batch)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/")
def get_batches(
    medicine_id: Optional[int] = None,
    include_expired: bool = False,
    db: Session = Depends(get_db),
):
    service = BatchManagementService(db)

    try:
        if medicine_id is None:
            batches = service.get_all_batches(include_expired=include_expired)
        else:
            batches = service.get_medicine_batches(
                medicine_id=medicine_id,
                include_expired=include_expired,
            )
        return [_serialize_batch(batch) for batch in batches]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/expiring-soon")
def get_batches_expiring_soon(days: int = 30, db: Session = Depends(get_db)):
    service = BatchManagementService(db)
    batches = service.get_batches_expiring_soon(days=days)
    return [_serialize_batch(batch) for batch in batches]


@router.get("/{batch_id}")
def get_batch_details(batch_id: int, db: Session = Depends(get_db)):
    service = BatchManagementService(db)
    try:
        details = service.get_batch_details(batch_id)
        batch = details["batch"]
        inventory = details["inventory"]
        return {
            "batch": _serialize_batch(batch),
            "inventory": None
            if not inventory
            else {
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
            },
            "total_quantity": details["total_quantity"],
        }
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.patch("/{batch_id}/deactivate")
def deactivate_batch(
    batch_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
):
    service = BatchManagementService(db)
    try:
        batch = service.deactivate_batch(batch_id=batch_id, reason=reason)
        return _serialize_batch(batch)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/check-expired")
def check_expired_batches(db: Session = Depends(get_db)):
    """Scan all batches and mark as expired if past expiry date."""
    service = BatchManagementService(db)
    count = service.check_and_mark_expired_batches()
    return {"message": f"Processed batches. {count} newly marked as expired."}


@router.get("/number/{batch_number}")
def get_batch_by_number(batch_number: str, medicine_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Find batch by batch number."""
    service = BatchManagementService(db)
    batch = service.get_batch_by_number(batch_number, medicine_id)
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch {batch_number} not found")
    return _serialize_batch(batch)
