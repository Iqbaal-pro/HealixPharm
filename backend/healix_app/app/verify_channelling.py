from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base
from app.channelling_models import Doctor, TimeSlot
import os

# Force SQLite for local testing environment
DATABASE_URL = "sqlite:///test_healix.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_and_seed():
    # Use the actual Base from app.db which the models already use
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print(f"Database {DATABASE_URL} reset and tables created.")

    db = SessionLocal()
    try:
        print("Seeding test data...")
        # Doctor Silva at Nawaloka Hospital
        doctor_silva = Doctor(
            name="Dr. Silva", 
            specialization="Cardiologist", 
            hospital="Nawaloka Hospital", 
            fee=2000.00, 
            service_fee=500.00,
            initials="DS"
        )
        db.add(doctor_silva)
        db.commit()
        db.refresh(doctor_silva)
        
        # Test Slot
        test_slot = TimeSlot(
            doctor_id=doctor_silva.id, 
            hospital_name="Nawaloka Hospital", 
            time="09:00 AM", 
            date="2026-03-15"
        )
        db.add(test_slot)
        db.commit()
        
        print("\nListing seeded data:")
        print(f"Doctor: {doctor_silva.name} (ID: {doctor_silva.id}) at {doctor_silva.hospital}")
        print(f"Slot: {test_slot.time} on {test_slot.date} (ID: {test_slot.id})")

    finally:
        db.close()

if __name__ == "__main__":
    verify_and_seed()
