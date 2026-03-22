import sys
import os

# Add the project root to the python path
sys.path.append(os.getcwd())

from app import models
from app.db import SessionLocal
from app.services.whatsapp_auth_service import WhatsAppAuthService

def test_auth():
    db = SessionLocal()
    phone = "1234567890"
    
    print(f"--- WhatsApp Auth Service Test ---")
    
    # 1. Ensure test patient exists
    patient = db.query(models.Patient).filter(models.Patient.phone_number == phone).first()
    if not patient:
        print(f"Creating test patient: {phone}")
        patient = models.Patient(phone_number=phone, name="Test Patient")
        db.add(patient)
        db.commit()
    else:
        print(f"Using existing test patient: {phone}")

    # 2. Test positive case
    is_auth = WhatsAppAuthService.is_authenticated(db, phone)
    print(f"Result for valid phone {phone}: {is_auth}")
    
    # 3. Test negative case
    fail_phone = "0000000000"
    is_auth_fail = WhatsAppAuthService.is_authenticated(db, fail_phone)
    print(f"Result for invalid phone {fail_phone}: {is_auth_fail}")

    # Cleanup
    db.delete(patient)
    db.commit()
    db.close()
    
    if is_auth == True and is_auth_fail == False:
        print("TEST PASSED: Auth service working correctly.")
        return True
    else:
        print("TEST FAILED: logic error.")
        return False

if __name__ == "__main__":
    if test_auth():
        sys.exit(0)
    else:
        sys.exit(1)
