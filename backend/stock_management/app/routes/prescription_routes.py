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
from app.models.medicine import Medicine
from app.services.refill_service import calculate_remaining_days
from app.services import s3_service

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
        # look up medicine name via FK
        medicine = db.query(Medicine).filter(Medicine.id == p.medicine_id).first()
        med_name = medicine.name if medicine else "Unknown"

        remaining_days = calculate_remaining_days(p)
        from app.models.reminder import Reminder as ReminderModel
        reminders_count = db.query(ReminderModel).filter(
            ReminderModel.prescription_id == p.id,
            ReminderModel.status == "pending"
        ).count()

        item = {
            "id": p.id,
            "patient_id": p.patient_id,
            "medicine_id": p.medicine_id,
            "medicine_name": med_name,
            "uploaded_by_staff_id": p.uploaded_by_staff_id,
            "dose_per_day": p.dose_per_day,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "quantity_given": p.quantity_given,
            "reminder_type": p.reminder_type,
            "is_continuous": p.is_continuous,
            "created_at": p.created_at,
            "remaining_days": remaining_days,
            "is_completed": remaining_days <= 0,
            "has_image": bool(p.s3_key),
            "reminders_count": reminders_count,
        }

        if not completed_only or item["is_completed"]:
            output.append(item)

    return output



@router.get("/issued-today")
def get_issued_today(db: Session = Depends(get_db)):
    """
    Fetch all medicines issued today — used to sync session across machines.
    """
    from app.models.issued_item import IssuedItem
    from app.models.medicine import Medicine
    from datetime import date

    today_start = datetime.combine(date.today(), datetime.min.time())

    rows = (
        db.query(
            IssuedItem.id,
            IssuedItem.prescription_id,
            IssuedItem.patient_id,
            IssuedItem.medicine_id,
            IssuedItem.quantity_issued,
            IssuedItem.issued_at,
            IssuedItem.issued_by,
            Medicine.name.label("medicine_name"),
        )
        .join(Medicine, Medicine.id == IssuedItem.medicine_id)
        .filter(IssuedItem.issued_at >= today_start)
        .order_by(IssuedItem.issued_at.desc())
        .all()
    )

    return [
        {
            "id":              r.id,
            "prescription_id": r.prescription_id,
            "patient_id":      r.patient_id,
            "medicine_id":     r.medicine_id,
            "medicine_name":   r.medicine_name,
            "quantity_issued": r.quantity_issued,
            "issued_at":       r.issued_at.isoformat() if r.issued_at else None,
            "issued_by":       r.issued_by,
        }
        for r in rows
    ]

@router.get("/{prescription_id}/image-url")
def get_prescription_image_url(
    prescription_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a presigned S3 URL to view the uploaded prescription image.
    The URL is valid for 1 hour.
    """
    repo = PrescriptionRepository(db)
    prescription = repo.get_by_id(prescription_id)

    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    if not prescription.s3_key:
        raise HTTPException(status_code=400, detail="No image uploaded for this prescription")

    try:
        url = s3_service.generate_presigned_url(prescription.s3_key)
        return {"url": url, "expires_in": 3600}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PrescriptionCreate(BaseModel):
    patient_id: int
    medicine_id: int
    uploaded_by_staff_id: int
    staff_id: int
    dose_per_day: int = 1
    quantity_given: int = 0
    is_continuous: bool = False
    reminder_type: str = "TIME_BASED"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    first_dose_time: Optional[datetime] = None


@router.post("/")
def create_prescription(
    payload: PrescriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new prescription record.
    """
    from app.services.scheduling_service import SchedulingService
    from datetime import timedelta

    start = payload.start_date or datetime.utcnow()
    end = payload.end_date or (start + timedelta(days=payload.quantity_given // max(payload.dose_per_day, 1)))

    svc = SchedulingService(db)
    try:
        rx = svc.schedule_medicine(
            patient_id=payload.patient_id,
            medicine_id=payload.medicine_id,
            staff_id=payload.staff_id or payload.uploaded_by_staff_id,
            quantity_issued=payload.quantity_given,
            dose_per_day=payload.dose_per_day,
            start_date=start,
            end_date=end,
            reminder_type=payload.reminder_type,
            first_dose_time=payload.first_dose_time or start,
        )
        # Count reminders scheduled
        from app.models.reminder import Reminder as ReminderModel
        reminders_scheduled = db.query(ReminderModel).filter(
            ReminderModel.prescription_id == rx.id
        ).count()
        return {
            "message": "Prescription created and reminders scheduled",
            "prescription_id": rx.id,
            "reminders_scheduled": reminders_scheduled,
            "medicine_name": db.query(Medicine).filter(Medicine.id == payload.medicine_id).first().name if db.query(Medicine).filter(Medicine.id == payload.medicine_id).first() else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        prescription_id=prescription_id,
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