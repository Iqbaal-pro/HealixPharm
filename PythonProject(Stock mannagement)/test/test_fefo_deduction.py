from datetime import datetime, timedelta
from app.models.medicine import Medicine
from app.services.batch_management_service import BatchManagementService
from app.services.fefo_deduction_service import FEFODeductionService
from app.models.inventory import Inventory
from app.models.stock_log import StockLog


def test_fefo_deduction_prefers_earliest_batch(db_session):
    db = db_session

    # create medicine
    med = Medicine(
        name="TestMed",
        sku="TM-001",
        dosage_form="tablet",
        strength="500mg",
        unit_of_measurement="tablet",
        cost_price=10.0,
        selling_price=15.0,
        minimum_stock_threshold=10,
    )
    db.add(med)
    db.flush()

    batch_service = BatchManagementService(db)

    # create two batches, one expiring sooner
    b1 = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="BATCH-A",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=10),
        cost_price=10.0,
        supplier_id=1,
        quantity_received=50
    )

    b2 = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="BATCH-B",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=40),
        cost_price=9.0,
        supplier_id=1,
        quantity_received=50
    )

    # confirm inventory entries
    inv1 = db.query(Inventory).filter(Inventory.batch_id == b1.id).first()
    inv2 = db.query(Inventory).filter(Inventory.batch_id == b2.id).first()
    assert inv1.quantity_available == 50
    assert inv2.quantity_available == 50

    fefo = FEFODeductionService(db)
    deductions = fefo.deduct_stock_fefo(medicine_id=med.id, quantity_needed=30, issued_to=1)

    # all deducted from earliest-expiry batch until it's exhausted
    assert sum(d['quantity_deducted'] for d in deductions) == 30

    # reload inventories
    inv1 = db.query(Inventory).filter(Inventory.batch_id == b1.id).first()
    inv2 = db.query(Inventory).filter(Inventory.batch_id == b2.id).first()

    assert inv1.quantity_available == 20
    assert inv2.quantity_available == 50

    # ensure stock logs created
    logs = db.query(StockLog).filter(StockLog.medicine_id == med.id).all()
    assert any(l.batch_id == b1.id for l in logs)
