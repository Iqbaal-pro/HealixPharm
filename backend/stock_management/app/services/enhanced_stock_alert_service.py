from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.inventory import Inventory
from app.models.medicine import Medicine
from app.models.batch import MedicineBatch
from app.models.stock_alert import StockAlert

class EnhancedStockAlertService:
    """
    Manages all stock alerts including:
    - Low stock (reached reorder_level)
    - Critical stock (below minimum_stock_threshold)
    - Expiry warnings (medicines expiring within 30 days)
    - Overstock (dead stock detection)
    """

    def __init__(self, db: Session):
        self.db = db
        self.expiry_warning_days = 30

    def check_all_alerts(self):
        """
        Scan all medicines and generate appropriate alerts
        """
        medicines = self.db.query(Medicine).filter(
            Medicine.is_active == True
        ).all()

        alerts_generated = []

        for medicine in medicines:
            # Check low stock
            low_stock = self.check_low_stock_alert(medicine.id)
            if low_stock:
                alerts_generated.append(low_stock)

            # Check critical stock
            critical = self.check_critical_stock_alert(medicine.id)
            if critical:
                alerts_generated.append(critical)

            # Check expiry
            expiry = self.check_expiry_alert(medicine.id)
            if expiry:
                alerts_generated.extend(expiry)

            # Check overstock
            overstock = self.check_overstock_alert(medicine.id)
            if overstock:
                alerts_generated.append(overstock)

        return alerts_generated

    def check_low_stock_alert(self, medicine_id: int):
        """
        Check if medicine quantity is below reorder level
        """
        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

        if not inventory:
            return None

        if inventory.quantity_available <= inventory.reorder_level:
            # Check if alert already exists
            existing = self.db.query(StockAlert).filter(
                and_(
                    StockAlert.medicine_id == medicine_id,
                    StockAlert.alert_type == "low_stock",
                    StockAlert.is_active == True
                )
            ).first()

            if not existing:
                alert = StockAlert(
                    medicine_id=medicine_id,
                    batch_id=inventory.batch_id,
                    alert_type="low_stock",
                    current_quantity=inventory.quantity_available,
                    threshold_value=inventory.reorder_level,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                self.db.add(alert)
                self.db.commit()
                return alert

        return None

    def check_critical_stock_alert(self, medicine_id: int):
        """
        Check if medicine is at critical level (below minimum threshold)
        """
        medicine = self.db.query(Medicine).filter(
            Medicine.id == medicine_id
        ).first()

        if not medicine:
            return None

        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

        if not inventory:
            return None

        if inventory.quantity_available < medicine.minimum_stock_threshold:
            existing = self.db.query(StockAlert).filter(
                and_(
                    StockAlert.medicine_id == medicine_id,
                    StockAlert.alert_type == "critical_stock",
                    StockAlert.is_active == True
                )
            ).first()

            if not existing:
                alert = StockAlert(
                    medicine_id=medicine_id,
                    batch_id=inventory.batch_id,
                    alert_type="critical_stock",
                    current_quantity=inventory.quantity_available,
                    threshold_value=medicine.minimum_stock_threshold,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                self.db.add(alert)
                self.db.commit()
                return alert

        return None

    def check_expiry_alert(self, medicine_id: int):
        """
        Check for batches expiring within specified days
        """
        expiry_threshold = datetime.utcnow() + timedelta(days=self.expiry_warning_days)

        batches_expiring = self.db.query(
            MedicineBatch
        ).filter(
            and_(
                MedicineBatch.medicine_id == medicine_id,
                MedicineBatch.expiry_date <= expiry_threshold,
                MedicineBatch.expiry_date > datetime.utcnow(),
                MedicineBatch.is_active == True
            )
        ).all()

        alerts = []

        for batch in batches_expiring:
            existing = self.db.query(StockAlert).filter(
                and_(
                    StockAlert.batch_id == batch.id,
                    StockAlert.alert_type == "expiry_warning",
                    StockAlert.is_active == True
                )
            ).first()

            if not existing:
                inventory = self.db.query(Inventory).filter(
                    and_(
                        Inventory.medicine_id == medicine_id,
                        Inventory.batch_id == batch.id
                    )
                ).first()

                alert = StockAlert(
                    medicine_id=medicine_id,
                    batch_id=batch.id,
                    alert_type="expiry_warning",
                    current_quantity=inventory.quantity_available if inventory else 0,
                    threshold_value=0,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                self.db.add(alert)
                alerts.append(alert)

        if alerts:
            self.db.commit()

        return alerts

    def check_overstock_alert(self, medicine_id: int):
        """
        Check for overstock (dead stock detection)
        If quantity is above maximum level and hasn't been dispensed in 90 days
        """
        medicine = self.db.query(Medicine).filter(
            Medicine.id == medicine_id
        ).first()

        if not medicine or not medicine.maximum_stock_level:
            return None

        inventory = self.db.query(Inventory).filter(
            Inventory.medicine_id == medicine_id
        ).first()

        if not inventory:
            return None

        # Check if stock exceeds maximum
        if inventory.quantity_available > medicine.maximum_stock_level:
            # Check if medicine was dispensed in last 90 days
            ninety_days_ago = datetime.utcnow() - timedelta(days=90)
            last_dispensed = inventory.last_dispensed_at

            if not last_dispensed or last_dispensed < ninety_days_ago:
                existing = self.db.query(StockAlert).filter(
                    and_(
                        StockAlert.medicine_id == medicine_id,
                        StockAlert.alert_type == "overstock",
                        StockAlert.is_active == True
                    )
                ).first()

                if not existing:
                    alert = StockAlert(
                        medicine_id=medicine_id,
                        batch_id=inventory.batch_id,
                        alert_type="overstock",
                        current_quantity=inventory.quantity_available,
                        threshold_value=medicine.maximum_stock_level,
                        is_active=True,
                        created_at=datetime.utcnow()
                    )
                    self.db.add(alert)
                    self.db.commit()
                    return alert

        return None

    def acknowledge_alert(self, alert_id: int, staff_id: int):
        """
        Mark alert as acknowledged by staff
        """
        alert = self.db.query(StockAlert).filter(
            StockAlert.id == alert_id
        ).first()

        if not alert:
            raise ValueError("Alert not found")

        alert.is_acknowledged = True
        alert.acknowledged_by = staff_id
        alert.acknowledged_at = datetime.utcnow()
        self.db.add(alert)
        self.db.commit()

        return alert

    def resolve_alert(self, alert_id: int):
        """
        Mark alert as resolved
        """
        alert = self.db.query(StockAlert).filter(
            StockAlert.id == alert_id
        ).first()

        if not alert:
            raise ValueError("Alert not found")

        alert.is_active = False
        alert.resolved_at = datetime.utcnow()
        self.db.add(alert)
        self.db.commit()

        return alert

    def get_active_alerts(self):
        """
        Get all active alerts
        """
        return self.db.query(StockAlert).filter(
            StockAlert.is_active == True
        ).all()
