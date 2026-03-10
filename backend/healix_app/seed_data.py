from app.db import SessionLocal, engine
from app import models

def seed_data():
    db = SessionLocal()
    try:
        # 1. Pharmacy Settings
        settings = [
            {"key": "opening_hours", "value": "Monday - Sunday: 8:00 AM - 10:00 PM"},
            {"key": "location", "value": "123 Healthcare Ave, Colombo 03, Sri Lanka"},
            {"key": "contact_phone", "value": "+94 11 234 5678"},
            {"key": "contact_email", "value": "info@healixpharm.com"}
        ]
        for s in settings:
            if not db.query(models.PharmacySetting).filter_by(key=s["key"]).first():
                db.add(models.PharmacySetting(**s))

        # 2. Delivery Settings
        delivery = [
            {"area": "Colombo 01-15", "charge": 300.0, "estimated_time": "2-4 hours"},
            {"area": "Greater Colombo", "charge": 500.0, "estimated_time": "Same day (within 8 hours)"},
            {"area": "Outstation", "charge": 800.0, "estimated_time": "1-2 business days"}
        ]
        for d in delivery:
            if not db.query(models.DeliverySetting).filter_by(area=d["area"]).first():
                db.add(models.DeliverySetting(**d))

        # 3. Policy Settings
        policies = [
            {"policy_type": "prescription", "content": "A valid prescription from a registered medical practitioner is mandatory for all scheduled medicines. Digital copies (photos) must be clear and legible."},
            {"policy_type": "refund", "content": "Medicines cannot be returned once delivered unless they are damaged or incorrect. Please check your order upon receipt."},
            {"policy_type": "cancellation", "content": "Orders can be cancelled within 10 minutes of placement or before verification by the pharmacist."}
        ]
        for p in policies:
            if not db.query(models.PolicySetting).filter_by(policy_type=p["policy_type"]).first():
                db.add(models.PolicySetting(**p))

        db.commit()
        print("Data seeding completed successfully!")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables are created (especially if running for the first time on a new DB)
    models.Base.metadata.create_all(bind=engine)
    seed_data()
