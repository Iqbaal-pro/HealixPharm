from app.channelling_db import SessionLocalChannelling, engine_channelling, BaseChannelling
from app.channelling_models import Doctor
from sqlalchemy.orm import Session

def verify_and_seed():
    # Ensure tables are created
    BaseChannelling.metadata.create_all(bind=engine_channelling)
    print("Channelling database tables ensured.")

    db = SessionLocalChannelling()
    try:
        # Check if doctors exist
        doctor_count = db.query(Doctor).count()
        if doctor_count == 0:
            print("Seeding initial doctors...")
            doctors = [
                Doctor(name="Dr. Aris", specialty="General Physician", fee="1500.00"),
                Doctor(name="Dr. Saman", specialty="Cardiologist", fee="2500.00"),
                Doctor(name="Dr. Kumari", specialty="Pediatrician", fee="1800.00")
            ]
            db.add_all(doctors)
            db.commit()
            print(f"Created {len(doctors)} doctors.")
        else:
            print(f"{doctor_count} doctors already exist in database.")
        print("\nListing Doctors:")
        for d in db.query(Doctor).all():
            print(f"- {d.name} ({d.specialty}) | Fee: {d.fee}")

    finally:
        db.close()

if __name__ == "__main__":
    verify_and_seed()
