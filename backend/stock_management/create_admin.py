from app.database.db import SessionLocal
from app.models.user import User
from app.models.pharmacy import Pharmacy
from app.services.auth_service import AuthService

def create_admin():
    db = SessionLocal()
    auth = AuthService(db)
    
    username = "admin"
    email = "admin@healixpharm.com"
    password = "admin123"
    
    # Check if exists
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User {username} already exists. Updating password to admin123.")
        existing.password = auth._hash_password(password)
        db.commit()
    else:
        print(f"Creating user {username}...")
        user, pharmacy = auth.signup(
            username=username,
            email=email,
            password=password,
            pharmacy_name="Healix Main Pharmacy",
            contact_number="0112233445",
            address="Nuccam Village, Sri Lanka"
        )
        print(f"Admin user created with ID: {user.id}")
    
    db.close()

if __name__ == "__main__":
    create_admin()
