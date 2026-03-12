from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.stock_update_service import StockUpdateService
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.inventory_repo import InventoryRepository
from app.repositories.stock_log_repo import StockLogRepository
from app.utils.data_exporter import DataExporter
from app.models.prescription import Prescription
from app.services.refill_service import calculate_remaining_days

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


class PrescriptionCreate(BaseModel):
    patient_id: int
    uploaded_by_staff_id: int
    medicine_name: str
    dose_per_day: int = 1
    quantity_given: int = 0
    is_continuous: bool = False
    start_date: Optional[datetime] = None


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_prescriptions(
    completed_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    List prescriptions.
    If completed_only=True, return only prescriptions whose supply is exhausted.
    """
    repo = PrescriptionRepository(db)
    prescriptions = repo.get_all()

    output = []
    for p in prescriptions:
        remaining_days = calculate_remaining_days(p)
        item = {
            "id": p.id,
            "patient_id": p.patient_id,
            "uploaded_by_staff_id": p.uploaded_by_staff_id,
            "medicine_name": p.medicine_name,
            "dose_per_day": p.dose_per_day,
            "start_date": p.start_date,
            "quantity_given": p.quantity_given,
            "is_continuous": p.is_continuous,
            "created_at": p.created_at,
            "remaining_days": remaining_days,
            "is_completed": remaining_days <= 0,
        }

        if not completed_only or item["is_completed"]:
            output.append(item)

    return output


@router.post("/")
def create_prescription(
    payload: PrescriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new prescription record.
    """
    repo = PrescriptionRepository(db)
    
    prescription = Prescription(
        patient_id=payload.patient_id,
        uploaded_by_staff_id=payload.uploaded_by_staff_id,
        medicine_name=payload.medicine_name,
        dose_per_day=payload.dose_per_day,
        quantity_given=payload.quantity_given,
        is_continuous=payload.is_continuous,
        start_date=payload.start_date or datetime.utcnow()
    )
    
    created = repo.create(prescription)
    return {
        "message": "Prescription created successfully",
        "prescription_id": created.id
    }


@router.post("/issue")
def issue_medicine(
    prescription_id: int,
    medicine_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    """
    Issue medicine for a prescription (staff action)
    """

    inventory_repo = InventoryRepository(db)
    stock_service = StockUpdateService()

    inventory = inventory_repo.get_by_medicine_id(medicine_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    updated_inventory = stock_service.issue_medicine(
        db=db,
        inventory=inventory,
        issued_quantity=quantity
    )

    exporter = DataExporter()
    export_data = exporter.prepare_issue_data(
        patient_id=1,          # comes from prescription (later)
        prescription_id=prescription_id,
        medicine_id=medicine_id,
        quantity_issued=quantity,
        issued_date=None
    )

    return {
        "message": "Medicine issued successfully",
        "remaining_stock": updated_inventory.quantity_available,
        "exported_data": export_data
    }
