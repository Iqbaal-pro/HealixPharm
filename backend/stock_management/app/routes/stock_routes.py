from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.batch import MedicineBatch
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
    unit_of_measurement:     Optional[str] = "Nos"
    cost_price:              float
    selling_price:           float
    minimum_stock_threshold: Optional[int] = 10

    # Batch details
    batch_number:     str
    manufacture_date: datetime
    expiry_date:      datetime
    supplier_id:      Optional[int] = None
    supplier_name:    Optional[str] = ""

    # Stock / CSV fields
    quantity:      int
    amount:        Optional[float] = None   # auto-calculated if not provided
    particulars:   Optional[str]   = "Cash" # Cash / Credit etc
    received_date: Optional[datetime] = None # date stock was received
    staff_id:      Optional[int]   = 1


class UpdateStockRequest(BaseModel):
    quantity_available:      Optional[int]   = None
    selling_price:           Optional[float] = None
    cost_price:              Optional[float] = None
    minimum_stock_threshold: Optional[int]   = None
    reorder_level:           Optional[int]   = None


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


# ── POST /stock/add ──────────────────────────────────────────────────
@router.post("/add")
def smart_add_stock(payload: AddStockSmartRequest, db: Session = Depends(get_db)):
    """
    One-call endpoint:
    1. Creates medicine if it doesn't exist (matched by name)
    2. Creates a new batch for that medicine
    3. Adds stock to inventory
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
            unit_of_measurement=payload.unit_of_measurement or "Nos",
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
    inventory_repo    = InventoryRepository(db)
    stock_update_repo = StockUpdateRepository(db)
    stock_service     = StockAddService(inventory_repo, stock_update_repo)

    # auto-calculate amount if not provided
    amount        = payload.amount if payload.amount else round(payload.selling_price * payload.quantity, 2)
    received_date = payload.received_date or datetime.utcnow()

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
        "category":         medicine.category,
        "unit":             medicine.unit_of_measurement,
        "batch_id":         batch.id,
        "batch_number":     batch.batch_number,
        "quantity_added":   payload.quantity,
        "selling_price":    payload.selling_price,
        "cost_price":       payload.cost_price,
        "amount":           amount,
        "particulars":      payload.particulars,
        "received_date":    received_date,
        "current_quantity": inventory.quantity_available,
    }


# ── PUT /stock/update/{inventory_id} ────────────────────────────────
@router.put("/update/{inventory_id}")
def update_stock(
    inventory_id: int,
    payload: UpdateStockRequest,
    db: Session = Depends(get_db)
):
    """
    Update quantity, prices or thresholds for an existing inventory record.
    """
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail=f"Inventory record {inventory_id} not found")

    if payload.quantity_available is not None:
        inventory.quantity_available = payload.quantity_available
    if payload.reorder_level is not None:
        inventory.reorder_level = payload.reorder_level
    inventory.last_stock_update = datetime.utcnow()
    db.commit()
    db.refresh(inventory)

    # Update medicine prices/threshold if provided
    if any([payload.selling_price, payload.cost_price, payload.minimum_stock_threshold]):
        medicine = db.query(Medicine).filter(Medicine.id == inventory.medicine_id).first()
        if medicine:
            if payload.selling_price is not None:
                medicine.selling_price = payload.selling_price
            if payload.cost_price is not None:
                medicine.cost_price = payload.cost_price
            if payload.minimum_stock_threshold is not None:
                medicine.minimum_stock_threshold = payload.minimum_stock_threshold
            db.commit()

    return {
        "message":            "Stock updated successfully",
        "inventory_id":       inventory.id,
        "medicine_id":        inventory.medicine_id,
        "quantity_available": inventory.quantity_available,
        "reorder_level":      inventory.reorder_level,
        "last_stock_update":  inventory.last_stock_update,
    }


# ── DELETE /stock/delete/{inventory_id} ─────────────────────────────
@router.delete("/delete/{inventory_id}")
def delete_stock(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an inventory record and deactivates its batch.
    Also deactivates the medicine if no other inventory records exist.
    """
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail=f"Inventory record {inventory_id} not found")

    medicine_id = inventory.medicine_id
    batch_id    = inventory.batch_id

    # Delete inventory record
    db.delete(inventory)
    db.commit()

    # Deactivate the batch
    batch = db.query(MedicineBatch).filter(MedicineBatch.id == batch_id).first()
    if batch:
        batch.is_active = False
        db.commit()

    # If no other inventory for this medicine, deactivate the medicine too
    remaining = db.query(Inventory).filter(Inventory.medicine_id == medicine_id).count()
    if remaining == 0:
        medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
        if medicine:
            medicine.is_active = False
            db.commit()

    return {
        "message":      "Stock deleted successfully",
        "inventory_id": inventory_id,
        "batch_id":     batch_id,
        "medicine_id":  medicine_id,
    }


# ── GET /stock/all ───────────────────────────────────────────────────
@router.get("/all")
def get_all_stock(db: Session = Depends(get_db)):
    """
    Get all stock with medicine name, batch details, prices and dates.
    """
    results = (
        db.query(Inventory, Medicine, MedicineBatch)
        .outerjoin(Medicine, Inventory.medicine_id == Medicine.id)
        .outerjoin(MedicineBatch, Inventory.batch_id == MedicineBatch.id)
        .all()
    )

    output = []
    for inv, med, batch in results:
        qty   = inv.quantity_available
        price = med.selling_price if med else 0
        output.append({
            "inventory_id":           inv.id,
            "medicine_id":            inv.medicine_id,
            "medicine_name":          med.name if med else "Unknown",
            "category":               med.category if med else "—",
            "dosage_form":            med.dosage_form if med else "—",
            "strength":               med.strength if med else "—",
            "unit":                   med.unit_of_measurement if med else "Nos",
            "selling_price":          price,
            "cost_price":             med.cost_price if med else 0,
            "amount":                 round(price * qty, 2),
            "batch_id":               inv.batch_id,
            "batch_number":           batch.batch_number if batch else "—",
            "manufacture_date":       batch.manufacture_date if batch else None,
            "expiry_date":            batch.expiry_date if batch else None,
            "is_expired":             batch.is_expired if batch else False,
            "is_active":              batch.is_active if batch else False,
            "quantity_available":     qty,
            "quantity_reserved":      inv.quantity_reserved,
            "quantity_damaged":       inv.quantity_damaged,
            "quantity_expired":       inv.quantity_expired,
            "reorder_level":          inv.reorder_level,
            "minimum_stock_threshold": med.minimum_stock_threshold if med else 10,
            "last_stock_update":      inv.last_stock_update,
            "last_dispensed_at":      inv.last_dispensed_at,
        })
    return output

