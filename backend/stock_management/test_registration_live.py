"""
Live test for User Registration (Signup).
Creates a test user and pharmacy in the Railway DB.
"""
import uuid
from app.database.db import SessionLocal
from app.services.auth_service import AuthService

def test_signup():
    db = SessionLocal()
    auth_service = AuthService(db)
    
    # Generate unique test data
    unique_id = str(uuid.uuid4())[:8]
    test_username = f"testuser_{unique_id}"
    test_email = f"test_{unique_id}@example.com"
    test_password = "password123"
    test_pharmacy = f"Test Pharmacy {unique_id}"
    
    print(f"Testing signup for: {test_username} ({test_email})")
    
    try:
        user, pharmacy = auth_service.signup(
            username=test_username,
            email=test_email,
            password=test_password,
            pharmacy_name=test_pharmacy,
            contact_number="0771234567",
            whatsapp_number="0777654321",
            address="123 Test Street, Colombo",
            service_charge=250.0
        )
        
        print("\nSUCCESS!")
        print(f"User created: ID={user.id}, Username={user.username}")
        print(f"Pharmacy created: ID={pharmacy.id}, Name={pharmacy.pharmacy_name}, UserID={pharmacy.user_id}")
        
        # Verify foreign key link
        if pharmacy.user_id == user.id:
            print("Verified: Pharmacy is correctly linked to User via user_id.")
        else:
            print("ERROR: Pharmacy user_id mismatch!")
            
    except Exception as e:
        print(f"\nFAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
