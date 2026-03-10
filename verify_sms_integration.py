import os
import sys

# Setup path to find the 'app' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))

from app.database.connection import SessionLocal
from app.services.sms_service import SMSService

def verify_integration():
    db = SessionLocal()
    sms_service = SMSService(db)
    
    # We need a dummy reminder_id for the log repo
    # In a real scenario, this would be an ID from the reminders table.
    # For testing, we'll try to find any existing reminder or just use a dummy one.
    # Note: ReminderLogRepository might fail if reminder_id doesn't exist in DB (FK constraint).
    
    to_number = "+94771443155"
    message = "HealixPharm Integration Test: Medicine reminders are now active!"
    
    print(f"Testing integration with SMSService...")
    
    # Using a dummy reminder_id 1 (assuming it exists or the repo is lenient)
    # Actually, let's just try to send it. If logging fails, we'll see it.
    try:
        success = sms_service.send_sms(to_number, message, reminder_id=None)
        if success:
            print("SUCCESS: SMSService integrated and verified!")
        else:
            print("FAILED: SMSService integration test failed.")
    except Exception as e:
        print(f"ERROR: Verification script encountered an error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_integration()
