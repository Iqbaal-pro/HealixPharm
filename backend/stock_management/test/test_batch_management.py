from datetime import datetime, timedelta
from app.models.medicine import Medicine
from app.services.batch_management_service import BatchManagementService
from app.models.inventory import Inventory


def test_create_batch_initializes_inventory(db_session):
    db = db_session

    med = Medicine(
        name="BatchMed",
        sku="BM-001",
        dosage_form="capsule",
        strength="250mg",
        unit_of_measurement="capsule",
        cost_price=5.0,
        selling_price=8.0,
        minimum_stock_threshold=5,
    )
    db.add(med)
    db.flush()

    batch_service = BatchManagementService(db)
    batch = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="LOT-100",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=365),
        cost_price=5.0,
        supplier_id=2,
        quantity_received=20
    )

    inv = db.query(Inventory).filter(Inventory.batch_id == batch.id).first()
    assert inv is not None
    assert inv.quantity_available == 20
