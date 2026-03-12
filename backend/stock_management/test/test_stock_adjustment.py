from datetime import datetime, timedelta
from app.models.medicine import Medicine
from app.services.batch_management_service import BatchManagementService
from app.services.stock_adjustment_service import StockAdjustmentService
from app.models.inventory import Inventory


def test_adjustment_marks_damaged_and_reduces_inventory(db_session):
    db = db_session

    med = Medicine(
        name="DamagedMed",
        sku="DM-001",
        dosage_form="syrup",
        strength="100ml",
        unit_of_measurement="ml",
        cost_price=20.0,
        selling_price=30.0,
        minimum_stock_threshold=2,
    )
    db.add(med)
    db.flush()

    batch_service = BatchManagementService(db)
    batch = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="DLOT-1",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=200),
        cost_price=20.0,
        supplier_id=3,
        quantity_received=10
    )

    adjust_service = StockAdjustmentService(db)
    adj = adjust_service.adjust_stock_damaged(
        medicine_id=med.id,
        batch_id=batch.id,
        quantity=3,
        staff_id=5,
        reason="Broken bottles"
    )

    inv = db.query(Inventory).filter(Inventory.batch_id == batch.id).first()
    assert inv.quantity_available == 7
    assert inv.quantity_damaged == 3
    assert adj.adjustment_type == "damaged"
