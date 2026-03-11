"""
Live test for InventoryRepository methods.
Verifies get_all() and get_low_stock() against the Railway DB.
"""
from app.database.db import SessionLocal
from app.repositories.inventory_repo import InventoryRepository
from app.models.inventory import Inventory

def test_inventory_methods():
    db = SessionLocal()
    repo = InventoryRepository(db)
    
    print("=" * 60)
    print("TESTING InventoryRepository.get_all()")
    print("=" * 60)
    try:
        all_inventory = repo.get_all()
        print(f"Total inventory records found: {len(all_inventory)}")
        for item in all_inventory:
            print(f" - ID: {item.id}, MedID: {item.medicine_id}, Available: {item.quantity_available}, ReorderLevel: {item.reorder_level}")
    except Exception as e:
        print(f"get_all() FAILED: {e}")

    print("\n" + "=" * 60)
    print("TESTING InventoryRepository.get_low_stock()")
    print("=" * 60)
    try:
        low_stock = repo.get_low_stock()
        print(f"Low stock records found: {len(low_stock)}")
        for item in low_stock:
            print(f" - [LOW STOCK] ID: {item.id}, MedID: {item.medicine_id}, Available: {item.quantity_available}, ReorderLevel: {item.reorder_level}")
    except Exception as e:
        print(f"get_low_stock() FAILED: {e}")

    print("\n" + "=" * 60)
    print("TESTING InventoryRepository.get_low_stocks() [Alias]")
    print("=" * 60)
    try:
        low_stocks = repo.get_low_stocks()
        print(f"Low stocks (alias) found: {len(low_stocks)}")
    except Exception as e:
        print(f"get_low_stocks() FAILED: {e}")

    db.close()

if __name__ == "__main__":
    test_inventory_methods()
