from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.stock_update_service import StockLogService
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.inventory_repo import InventoryRepository
from app.repositories.stock_log_repo import StockLogRepository
from app.utils.data_exporter import DataExporter
from app.services.refill_service import calculate_remaining_days

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


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
    stock_log_repo = StockLogRepository(db)
    stock_service = StockLogService(
        inventory_repo,
        stock_log_repo
    )

    inventory = inventory_repo.get_by_medicine_id(medicine_id)

    updated_inventory = stock_service.issue_medicine(
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
