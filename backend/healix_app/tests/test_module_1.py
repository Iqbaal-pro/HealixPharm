import sys
import os
from datetime import datetime, timedelta

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db import SessionLocal, engine, Base
from app import models

def test_module_1():
    print("--- STARTING MODULE 1 TEST (DATABASE SETUP) ---")
    
    # 1. Create tables if they don't exist
    print("Step 1: Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables ensured.")

    db = SessionLocal()
    try:
        # 2. Test Patient Table
        print("\nStep 2: Testing 'patients' table...")
        test_phone = "+94771234567"
        # Check if exists first to avoid unique constraint error on re-run
        existing_patient = db.query(models.Patient).filter(models.Patient.phone_number == test_phone).first()
        if not existing_patient:
            new_patient = models.Patient(phone_number=test_phone, is_active=True)
            db.add(new_patient)
            db.commit()
            print(f"Added patient: {test_phone}")
        else:
            print(f"Patient {test_phone} already exists.")

        # 3. Test MOHDiseaseAlert Table
        print("\nStep 3: Testing 'moh_disease_alerts' table...")
        new_alert = models.MOHDiseaseAlert(
            disease_name="Test Virus",
            region="Western",
            threat_level="High",
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=7),
            status="Active",
            broadcast_sent=False
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        print(f"Added MOH Alert for '{new_alert.disease_name}' with ID: {new_alert.id}")

        # 4. Test AlertBroadcastLog Table
        print("\nStep 4: Testing 'alert_broadcast_log' table...")
        log_entry = models.AlertBroadcastLog(
            alert_id=new_alert.id,
            phone_number=test_phone,
            send_status="SENT",
            api_response="{'status': 'success'}"
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        print(f"Added log entry for Alert ID {log_entry.alert_id} and Phone {log_entry.phone_number}")

        # 5. Verify data
        print("\nStep 5: Verifying data counts...")
        patient_count = db.query(models.Patient).count()
        alert_count = db.query(models.MOHDiseaseAlert).count()
        log_count = db.query(models.AlertBroadcastLog).count()
        
        print(f"Total Patients: {patient_count}")
        print(f"Total MOH Alerts: {alert_count}")
        print(f"Total Broadcast Logs: {log_count}")
        
        print("\n--- MODULE 1 TEST COMPLETED SUCCESSFULLY ---")

    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_module_1()
