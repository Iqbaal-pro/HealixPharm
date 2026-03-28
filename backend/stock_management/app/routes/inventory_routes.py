from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.stock_add_service import StockAddService
from app.database.db import SessionLocal
from app.repositories.inventory_repo import InventoryRepository
from app.repositories.stock_update_repo import StockUpdateRepository

router = APIRouter(prefix="/inventory", tags=["Inventory"])


class AddStockRequest(BaseModel):
    medicine_id: int
    batch_id: int
    batch_number: str
    expiry_date: datetime
    quantity_added: int
    cost_price: float
    supplier_id: int
    supplier_name: str
    staff_id: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

'''
@router.get("/")
def get_all_inventory(db: Session = Depends(get_db)):
    """
    Get all inventory records
    """
    repo = InventoryRepository(db)
    return repo.get_all()
'''
@router.get("/")
def get_all_inventory(db: Session = Depends(get_db)):
    from app.models.medicine import Medicine
    from app.models.inventory import Inventory
    from app.models.batch import MedicineBatch

    results = (
        db.query(Inventory, Medicine, MedicineBatch)
        .outerjoin(Medicine, Inventory.medicine_id == Medicine.id)
        .outerjoin(MedicineBatch, Inventory.batch_id == MedicineBatch.id)
        .all()
    )

    output = []
    for inv, med, batch in results:
        output.append({
            "id":                 inv.id,
            "medicine_id":        inv.medicine_id,
            "medicine_name":      med.name if med else "Unknown",
            "category":           med.category if med else "—",
            "dosage_form":        med.dosage_form if med else "—",
            "strength":           med.strength if med else "—",
            "selling_price":      med.selling_price if med else 0,
            "cost_price":         med.cost_price if med else 0,
            "batch_id":           inv.batch_id,
            "batch_number":       batch.batch_number if batch else "—",
            "manufacture_date":   batch.manufacture_date if batch else None,
            "expiry_date":        batch.expiry_date if batch else None,
            "is_expired":         batch.is_expired if batch else False,
            "is_active":          batch.is_active if batch else False,
            "supplier_id":        batch.supplier_id if batch else None,
            "quantity_available": inv.quantity_available,
            "quantity_reserved":  inv.quantity_reserved,
            "quantity_damaged":   inv.quantity_damaged,
            "quantity_expired":   inv.quantity_expired,
            "reorder_level":      inv.reorder_level,
            "reorder_quantity":   inv.reorder_quantity,
            "last_stock_update":  inv.last_stock_update,
            "last_dispensed_at":  inv.last_dispensed_at,
        })
    return output

@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    """
    Get medicines below reorder level
    """
    repo = InventoryRepository(db)
    return repo.get_low_stock()
