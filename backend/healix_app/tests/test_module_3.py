import sys
import os
from datetime import datetime, timedelta

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db import SessionLocal, engine, Base
from app import models
from app.services import alert_service

def test_module_3():
    print("--- STARTING MODULE 3 TEST (CRUD / REPOSITORY FUNCTIONS) ---")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clean up existing test data to have a fresh state
        db.query(models.MOHDiseaseAlert).delete()
        db.query(models.Patient).delete()
        db.query(models.AlertBroadcastLog).delete()
        db.commit()

        today = datetime.now()
        
        # 1. Setup Test Patients
        print("Step 1: Setting up test patients...")
        p1 = models.Patient(phone_number="+94771111111", is_active=True)
        p2 = models.Patient(phone_number="+94772222222", is_active=False)
        db.add_all([p1, p2])
        db.commit()
        
        # Test GetActivePatientNumbers
        active_numbers = alert_service.get_active_patient_numbers(db)
        print(f"Active patient numbers: {active_numbers}")
        assert "+94771111111" in active_numbers
        assert "+94772222222" not in active_numbers
        print("Pass: get_active_patient_numbers")

        # 2. Setup Test Alerts
        print("\nStep 2: Setting up test alerts...")
        # Eligible alert
        a1 = models.MOHDiseaseAlert(
            disease_name="Fever", region="West", threat_level="High",
            status="Active", broadcast_sent=False,
            start_date=today - timedelta(days=1),
            end_date=today + timedelta(days=1)
        )
        # Low threat (ineligible)
        a2 = models.MOHDiseaseAlert(
            disease_name="Cold", region="East", threat_level="Low",
            status="Active", broadcast_sent=False,
            start_date=today - timedelta(days=1),
            end_date=today + timedelta(days=1)
        )
        # Already sent (ineligible)
        a3 = models.MOHDiseaseAlert(
            disease_name="Flu", region="North", threat_level="High",
            status="Active", broadcast_sent=True,
            start_date=today - timedelta(days=1),
            end_date=today + timedelta(days=1)
        )
        # Expired date (ineligible)
        a4 = models.MOHDiseaseAlert(
            disease_name="COVID", region="South", threat_level="High",
            status="Active", broadcast_sent=False,
            start_date=today - timedelta(days=5),
            end_date=today - timedelta(days=1)
        )
        db.add_all([a1, a2, a3, a4])
        db.commit()

        # Test GetEligibleAlerts
        eligible = alert_service.get_eligible_alerts(db, today)
        print(f"Eligible alerts count: {len(eligible)}")
        assert len(eligible) == 1
        assert eligible[0].disease_name == "Fever"
        print("Pass: get_eligible_alerts")

        # Test ExpireOldAlerts
        print("\nStep 3: Testing expire_old_alerts...")
        expired_count = alert_service.expire_old_alerts(db, today)
        print(f"Expired {expired_count} alerts.")
        assert expired_count >= 1
        # Re-fetch a4
        db.refresh(a4)
        assert a4.status == "Expired"
        print("Pass: expire_old_alerts")

        # Test MarkBroadcastSent
        print("\nStep 4: Testing mark_broadcast_sent...")
        alert_service.mark_broadcast_sent(db, a1.id)
        db.refresh(a1)
        assert a1.broadcast_sent is True
        print("Pass: mark_broadcast_sent")

        # Test SaveBroadcastLog
        print("\nStep 5: Testing save_broadcast_log...")
        log = alert_service.save_broadcast_log(db, a1.id, "+94771111111", "SENT", "OK")
        assert log.id is not None
        assert log.send_status == "SENT"
        print("Pass: save_broadcast_log")

        # Test UpdateRetry
        print("\nStep 6: Testing update_retry...")
        initial_retry = a1.retry_count
        alert_service.update_retry(db, a1.id)
        db.refresh(a1)
        assert a1.retry_count == initial_retry + 1
        assert a1.last_attempt_at is not None
        print("Pass: update_retry")

        print("\n--- MODULE 3 TESTS COMPLETED SUCCESSFULLY ---")

    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_module_3()
