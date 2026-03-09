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


@router.get("/")
def get_all_inventory(db: Session = Depends(get_db)):
    """
    Get all inventory records
    """
    repo = InventoryRepository(db)
    return repo.get_all()


@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    """
    Get medicines below reorder level
    """
    repo = InventoryRepository(db)
    return repo.get_low_stock()

@router.post("/add-stock")
def add_stock(
    payload: AddStockRequest,
    db: Session = Depends(get_db)
):
    inventory_repo = InventoryRepository(db)
    stock_update_repo = StockUpdateRepository(db)

    service = StockAddService(
        inventory_repo,
        stock_update_repo
    )

    updated_inventory = service.add_stock(
        medicine_id=payload.medicine_id,
        batch_id=payload.batch_id,
        batch_number=payload.batch_number,
        expiry_date=payload.expiry_date,
        quantity_added=payload.quantity_added,
        cost_price=payload.cost_price,
        supplier_id=payload.supplier_id,
        supplier_name=payload.supplier_name,
        staff_id=payload.staff_id,
        db=db
    )

    return {
        "message": "Stock added successfully",
        "current_quantity": updated_inventory.quantity_available
    }
