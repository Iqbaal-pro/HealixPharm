from app.db import SessionLocal
from app import models
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    print("--- Basic Database Connection Test ---")
    print(f"Connecting to: {os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}")
    
    db = SessionLocal()
    try:
        # 1. Test Alert Table
        alert_count = db.query(models.MOHDiseaseAlert).count()
        print(f"[OK] Connected! Found {alert_count} alerts in 'moh_disease_alerts'.")
        
        # 2. Test Patient Table
        patient_count = db.query(models.Patient).count()
        print(f"[OK] Found {patient_count} patients in 'patients'.")

        # 3. Test Alert Broadcast Log Table
        log_count = db.query(models.AlertBroadcastLog).count()
        print(f"[OK] Found {log_count} logs in 'alert_broadcast_log'.")
        
        print("\nSUCCESS: Connection is active and tables are accessible.")
        
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()
