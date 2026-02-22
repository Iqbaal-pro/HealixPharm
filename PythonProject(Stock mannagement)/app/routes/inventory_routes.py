from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.stock_add_service import StockAddService
from app.database.db import SessionLocal
from app.repositories.inventory_repo import InventoryRepository
from app.repositories.stock_update_repo import StockUpdateRepository

router = APIRouter(prefix="/inventory", tags=["Inventory"])


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
    medicine_id: int,
    quantity_added: int,
    supplier_name: str,
    staff_id: int,
    db: Session = Depends(get_db)
):
    inventory_repo = InventoryRepository(db)
    stock_update_repo = StockUpdateRepository(db)

    service = StockAddService(
        inventory_repo,
        stock_update_repo
    )

    inventory = inventory_repo.get_by_medicine_id(medicine_id)

    updated_inventory = service.add_stock(
        inventory=inventory,
        quantity_added=quantity_added,
        supplier_name=supplier_name,
        staff_id=staff_id
    )

    return {
        "message": "Stock added successfully",
        "current_quantity": updated_inventory.quantity_available
    }

