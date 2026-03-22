from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.medicine import Medicine
from app.services.batch_management_service import BatchManagementService
from app.services.stock_add_service import StockAddService
from app.repositories.inventory_repo import InventoryRepository
from app.repositories.stock_update_repo import StockUpdateRepository

router = APIRouter(prefix="/stock", tags=["Stock"])


class AddStockSmartRequest(BaseModel):
    # Medicine details
    medicine_name:           str
    category:                Optional[str] = "Other Meds/Unclassified"
    dosage_form:             Optional[str] = "tablet"
    strength:                Optional[str] = None
    unit_of_measurement:     Optional[str] = "tablet"
    cost_price:              float
    selling_price:           float
    minimum_stock_threshold: Optional[int] = 10

    # Batch details
    batch_number:     str
    manufacture_date: datetime
    expiry_date:      datetime
    supplier_id:      Optional[int] = None
    supplier_name:    Optional[str] = ""

    # Stock details
    quantity:  int
    staff_id:  Optional[int] = 1


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _make_sku(name: str, db: Session) -> str:
    """Auto-generate a unique SKU from medicine name."""
    words = name.strip().upper().split()
    base = "-".join(w[:4] for w in words[:3])
    sku = base
    counter = 1
    while db.query(Medicine).filter(Medicine.sku == sku).first():
        sku = f"{base}-{counter}"
        counter += 1
    return sku


@router.post("/add")
def smart_add_stock(payload: AddStockSmartRequest, db: Session = Depends(get_db)):
    """
    One-call endpoint:
    1. Creates medicine if it doesn't exist (matched by name)
    2. Creates a new batch for that medicine
    3. Adds stock to inventory

    Returns medicine_id, batch_id, and updated quantity.
    """

    # ── Step 1: Get or create medicine ──────────────────────────────
    medicine = db.query(Medicine).filter(
        Medicine.name == payload.medicine_name.strip()
    ).first()

    if not medicine:
        sku = _make_sku(payload.medicine_name, db)
        medicine = Medicine(
            name=payload.medicine_name.strip(),
            sku=sku,
            dosage_form=payload.dosage_form or "tablet",
            strength=payload.strength,
            unit_of_measurement=payload.unit_of_measurement or "tablet",
            category=payload.category,
            cost_price=payload.cost_price,
            selling_price=payload.selling_price,
            minimum_stock_threshold=payload.minimum_stock_threshold or 10,
        )
        db.add(medicine)
        db.commit()
        db.refresh(medicine)

    # ── Step 2: Create batch ─────────────────────────────────────────
    batch_service = BatchManagementService(db)
    try:
        batch = batch_service.create_batch(
            medicine_id=medicine.id,
            batch_number=payload.batch_number.strip(),
            manufacture_date=payload.manufacture_date,
            expiry_date=payload.expiry_date,
            cost_price=payload.cost_price,
            supplier_id=payload.supplier_id,
            quantity_received=payload.quantity,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── Step 3: Add stock to inventory ───────────────────────────────
    inventory_repo   = InventoryRepository(db)
    stock_update_repo = StockUpdateRepository(db)
    stock_service    = StockAddService(inventory_repo, stock_update_repo)

    inventory = stock_service.add_stock(
        medicine_id=medicine.id,
        batch_id=batch.id,
        batch_number=payload.batch_number.strip(),
        expiry_date=payload.expiry_date,
        quantity_added=payload.quantity,
        cost_price=payload.cost_price,
        supplier_id=payload.supplier_id or 0,
        supplier_name=payload.supplier_name or "",
        staff_id=payload.staff_id or 1,
        db=db,
    )

    return {
        "message":          "Stock added successfully",
        "medicine_id":      medicine.id,
        "medicine_name":    medicine.name,
        "batch_id":         batch.id,
        "batch_number":     batch.batch_number,
        "quantity_added":   payload.quantity,
        "current_quantity": inventory.quantity_available,
    }
