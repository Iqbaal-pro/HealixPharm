import os
import sys

# Setup environment and path
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "Angel@0602!")
os.environ.setdefault("DB_NAME", "healixpharm")
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))

from app.database.connection import SessionLocal
from app.services.whatsapp_auth_service import WhatsAppAuthService
from app.models.whatsapp_user import WhatsAppUser

def run_auth_test():
    db = SessionLocal()
    test_phone = "+94711223344"
    unregistered_phone = "+94770000000"
    
    try:
        print("\n--- WhatsApp Authentication Flow Test ---")
        
        # 1. Check if an unregistered number can access
        print(f"\nChecking unregistered number: {unregistered_phone}")
        is_auth = WhatsAppAuthService.is_authenticated(db, unregistered_phone)
        print(f"Authenticated: {is_auth}")
        if not is_auth:
            print("SUCCESS: Unregistered number was BLOCKED.")
        else:
            print("FAILED: Unregistered number was ALLOWED.")

        # 2. Register the test number
        print(f"\nRegistering test number: {test_phone}")
        # Clean up if exists from previous crashed run
        existing = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == test_phone).first()
        if existing:
            db.delete(existing)
            db.commit()
            
        new_user = WhatsAppUser(name="Test WhatsApp User", phone_number=test_phone, role="patient")
        db.add(new_user)
        db.commit()
        print(f"SUCCESS: Registered {test_phone}")

        # 3. Check if registered number can access
        print(f"\nChecking registered number: {test_phone}")
        is_auth = WhatsAppAuthService.is_authenticated(db, test_phone)
        print(f"Authenticated: {is_auth}")
        if is_auth:
            print("SUCCESS: Registered number was ALLOWED.")
        else:
            print("FAILED: Registered number was BLOCKED.")

        # 4. Clean up
        db.delete(new_user)
        db.commit()
        print("\nSUCCESS: Test finished! (Test user cleaned up)")

    except Exception as e:
        print(f"Test Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_auth_test()
