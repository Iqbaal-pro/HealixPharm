import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db import SessionLocal
from app.services.whatsapp_auth_service import WhatsAppAuthService
from app import models

def run_test():
    print("--- WhatsApp Patient Authentication Tester ---")
    db = SessionLocal()
    
    test_phone = "+94711223344"
    unregistered_phone = "+94770000000"
    
    try:
        # 1. Test unregistered number
        print(f"\n[Test 1] Checking unregistered number: {unregistered_phone}")
        is_auth = WhatsAppAuthService.is_authenticated(db, unregistered_phone)
        print(f"Result: {'Authenticated' if is_auth else 'Blocked'}")
        if not is_auth:
            print("SUCCESS: Unregistered number was correctly blocked.")
        else:
            print("FAILED: Unregistered number was allowed.")

        # 2. Register a temporary patient
        print(f"\n[Setup] Registering temporary test patient: {test_phone}")
        # Clean up if exists from a previous failed run
        db.query(models.Patient).filter(models.Patient.phone_number == test_phone).delete()
        db.commit()
        
        new_patient = models.Patient(phone_number=test_phone, is_active=True)
        db.add(new_patient)
        db.commit()
        print(f"Setup: Patient {test_phone} added to database.")

        # 3. Test registered number
        print(f"\n[Test 2] Checking registered number: {test_phone}")
        is_auth = WhatsAppAuthService.is_authenticated(db, test_phone)
        print(f"Result: {'Authenticated' if is_auth else 'Blocked'}")
        if is_auth:
            print("SUCCESS: Registered patient was correctly allowed.")
        else:
            print("FAILED: Registered patient was blocked.")

        # 4. Test inactive patient
        print(f"\n[Setup] Setting patient {test_phone} to inactive...")
        new_patient.is_active = False
        db.commit()

        print(f"\n[Test 3] Checking inactive registered number: {test_phone}")
        is_auth = WhatsAppAuthService.is_authenticated(db, test_phone)
        print(f"Result: {'Authenticated' if is_auth else 'Blocked'}")
        if not is_auth:
            print("SUCCESS: Inactive patient was correctly blocked.")
        else:
            print("FAILED: Inactive patient was allowed.")

    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        # Cleanup
        print(f"\n[Cleanup] Removing temporary test patient {test_phone}")
        db.query(models.Patient).filter(models.Patient.phone_number == test_phone).delete()
        db.commit()
        db.close()
        print("--- Test Finished ---")

if __name__ == "__main__":
    run_test()
