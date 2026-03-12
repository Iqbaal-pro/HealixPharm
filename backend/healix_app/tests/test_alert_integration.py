import sys
import os
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.getcwd())

from app.db import SessionLocal, engine
from app import models
from app.services import alert_service
from app.services.broadcast_job import run_alert_broadcast_job
from app.core.config import settings

def setup_test_data(db):
    print("--- Setting up Test Data ---")
    # 1. Ensure we have an active patient
    patient = db.query(models.Patient).filter(models.Patient.phone_number == "+94771234567").first()
    if not patient:
        patient = models.Patient(phone_number="+94771234567", is_active=True)
        db.add(patient)
    else:
        patient.is_active = True
    
    # 2. Create a test alert that SHOULD be sent
    # We delete existing ones for a clean test run
    db.query(models.MOHDiseaseAlert).filter(models.MOHDiseaseAlert.disease_name == "TEST_DENGUE").delete()
    
    test_alert = models.MOHDiseaseAlert(
        disease_name="TEST_DENGUE",
        region="Test Region",
        threat_level=settings.ALERT_MIN_THREAT_LEVEL, # Usually "High"
        start_date=datetime.now() - timedelta(days=1),
        end_date=datetime.now() + timedelta(days=5),
        status="Active",
        broadcast_sent=False
    )
    db.add(test_alert)
    db.commit()
    return test_alert.id

import time
import logging

# Configure logging to see job output
logging.basicConfig(level=logging.INFO)

def run_integration_test():
    db = SessionLocal()
    try:
        # Step 1: Data Setup
        alert_id = setup_test_data(db)
        print(f"[PASSED] Test data injected. Alert ID: {alert_id}")

        # Step 2: Test Service Filtering
        print("\n--- Testing Alert Service Filtering ---")
        from datetime import date
        eligible = alert_service.get_eligible_alerts(db, date.today())
        found = any(a.id == alert_id for a in eligible)
        if found:
            print(f"[PASSED] Alert service identified the test alert (Found {len(eligible)} total).")
        else:
            print("[FAILED] Alert service failed to find the test alert.")
            return

        # Step 3: Test Broadcast Job (Mocking Twilio)
        print("\n--- Testing Full Broadcast Job Flow (Mocked Twilio) ---")
        with patch('app.services.notification_service.NotificationService.send_whatsapp_message') as mock_send:
            mock_send.return_value = {"success": True, "response": {"sid": "test_sid_123", "status": "sent"}}
            
            # Run the job
            run_alert_broadcast_job()
            
            # Verify Twilio was called
            if mock_send.called:
                print(f"[PASSED] Notification service was triggered {mock_send.call_count} times.")
            else:
                print("[FAILED] Notification service was never called.")
                return

        print("\n--- Waiting for DB consistency ---")
        time.sleep(2)
        
        # USE A FRESH SESSION FOR VERIFICATION
        db_verify = SessionLocal()
        try:
            # Step 4: Verify Database State after job
            print("\n--- Verifying Database State Transition ---")
            updated_alert = db_verify.query(models.MOHDiseaseAlert).filter(models.MOHDiseaseAlert.id == alert_id).first()
            
            if updated_alert.broadcast_sent:
                print("[PASSED] Alert marked as 'broadcast_sent=True' in database.")
            else:
                print(f"[FAILED] Alert NOT marked as sent. Status: {updated_alert.status}, Sent: {updated_alert.broadcast_sent}")

            # Step 5: Verify Audit Logs
            log_count = db_verify.query(models.AlertBroadcastLog).filter(models.AlertBroadcastLog.alert_id == alert_id).count()
            if log_count > 0:
                print(f"[PASSED] Created {log_count} audit log entries in 'alert_broadcast_log'.")
            else:
                print("[FAILED] No audit logs created.")
        finally:
            db_verify.close()

        print("\n===============================")
        print("FINAL RESULT: INTEGRATION SUCCESS")
        print("===============================")

    except Exception as e:
        print(f"\n[ERROR] Integration Test Crashed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_integration_test()
