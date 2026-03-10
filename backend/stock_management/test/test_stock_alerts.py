from datetime import datetime, timedelta
from app.models.medicine import Medicine
from app.services.batch_management_service import BatchManagementService
from app.services.enhanced_stock_alert_service import EnhancedStockAlertService


def test_expiry_and_low_stock_alerts(db_session):
    db = db_session

    med = Medicine(
        name="AlertMed",
        sku="AM-001",
        dosage_form="tablet",
        strength="50mg",
        unit_of_measurement="tablet",
        cost_price=2.0,
        selling_price=5.0,
        minimum_stock_threshold=5,
        maximum_stock_level=100
    )
    db.add(med)
    db.flush()

    batch_service = BatchManagementService(db)
    # batch expiring soon
    batch1 = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="ALOT-1",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=20),
        cost_price=2.0,
        supplier_id=4,
        quantity_received=4
    )

    # batch with more stock
    batch2 = batch_service.create_batch(
        medicine_id=med.id,
        batch_number="ALOT-2",
        manufacture_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=200),
        cost_price=2.0,
        supplier_id=4,
        quantity_received=10
    )

    alert_service = EnhancedStockAlertService(db)
    alerts = alert_service.check_all_alerts()

    # Expect at least one expiry warning and a low stock alert for batch1 (4 < reorder threshold)
    assert any(a.alert_type == "expiry_warning" for a in alerts)
    assert any(a.alert_type == "low_stock" for a in alerts)
