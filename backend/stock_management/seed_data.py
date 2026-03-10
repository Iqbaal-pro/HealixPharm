"""
Seed Data – populates the database with sample patients, prescriptions,
and reminders for testing the reminder/refill system.

Run:  python -m seed_data
"""
from datetime import datetime, timedelta
from app.database.db import SessionLocal, engine
from app.database.base import Base
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.reminder import Reminder


def seed():
    """Insert dummy data for demonstration & testing."""

    # ─── Create all tables ──────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ════════════════════════════════════════════════════════
        # PATIENTS (2 with consent, 1 without)
        # ════════════════════════════════════════════════════════
        patient1 = Patient(
            name="Kamal Perera",
            phone_number="+94771234567",
            language="si",
            consent=True          # ✅ will receive reminders
        )
        patient2 = Patient(
            name="Nimal Silva",
            phone_number="+94777654321",
            language="en",
            consent=True          # ✅ will receive reminders
        )
        patient3 = Patient(
            name="Rani Fernando",
            phone_number="+94779999999",
            language="en",
            consent=False         # ❌ no consent → no reminders
        )

        db.add_all([patient1, patient2, patient3])
        db.commit()
        db.refresh(patient1)
        db.refresh(patient2)
        db.refresh(patient3)

        print(f"✅ Created patients: {patient1.name}, {patient2.name}, {patient3.name}")

        # ════════════════════════════════════════════════════════
        # PRESCRIPTIONS
        # ════════════════════════════════════════════════════════

        # Patient 1: continuous medication (Metformin – diabetes)
        rx1 = Prescription(
            patient_id=patient1.id,
            uploaded_by_staff_id=1,
            medicine_name="Metformin 500mg",
            dose_per_day=2,
            start_date=datetime.utcnow() - timedelta(days=25),
            quantity_given=60,       # 60 tablets / 2 per day = 30 days
            is_continuous=True       # ✅ long-term medication
        )

        # Patient 1: short-term medication (Amoxicillin – 5-day course)
        rx2 = Prescription(
            patient_id=patient1.id,
            uploaded_by_staff_id=1,
            medicine_name="Amoxicillin 250mg",
            dose_per_day=3,
            start_date=datetime.utcnow() - timedelta(days=3),
            quantity_given=15,       # 15 capsules / 3 per day = 5 days
            is_continuous=False      # ❌ short-term → no refill reminders
        )

        # Patient 2: continuous medication (Amlodipine – blood pressure)
        rx3 = Prescription(
            patient_id=patient2.id,
            uploaded_by_staff_id=2,
            medicine_name="Amlodipine 5mg",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=27),
            quantity_given=30,       # 30 tablets / 1 per day = 30 days
            is_continuous=True       # ✅ long-term
        )

        # Patient 2: auto-detect long-term (quantity/dose > 7 days)
        rx4 = Prescription(
            patient_id=patient2.id,
            uploaded_by_staff_id=2,
            medicine_name="Omeprazole 20mg",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=12),
            quantity_given=14,       # 14 / 1 = 14 days (>7 day threshold)
            is_continuous=False      # not marked, but will be auto-detected
        )

        # Patient 3: she has no consent, so no reminders should go out
        rx5 = Prescription(
            patient_id=patient3.id,
            uploaded_by_staff_id=1,
            medicine_name="Losartan 50mg",
            dose_per_day=1,
            start_date=datetime.utcnow() - timedelta(days=28),
            quantity_given=30,
            is_continuous=True       # continuous, but patient has no consent
        )

        db.add_all([rx1, rx2, rx3, rx4, rx5])
        db.commit()

        for rx in [rx1, rx2, rx3, rx4, rx5]:
            db.refresh(rx)

        print(f"✅ Created {5} prescriptions")

        # ════════════════════════════════════════════════════════
        # SAMPLE REMINDERS (one pending, one already sent)
        # ════════════════════════════════════════════════════════
        reminder1 = Reminder(
            prescription_id=rx1.id,
            reminder_time=datetime.utcnow(),
            channel="sms",
            status="pending",
            one_time=False
        )
        reminder2 = Reminder(
            prescription_id=rx3.id,
            reminder_time=datetime.utcnow() - timedelta(days=1),
            channel="sms",
            status="sent",        # already sent yesterday
            one_time=True
        )

        db.add_all([reminder1, reminder2])
        db.commit()

        print("✅ Created 2 sample reminders (1 pending, 1 sent)")

        # ════════════════════════════════════════════════════════
        # SUMMARY
        # ════════════════════════════════════════════════════════
        print("\n─── Seed Data Summary ─────────────────────────")
        print(f"  Patients:      3 (2 consented, 1 not)")
        print(f"  Prescriptions: 5 (2 continuous, 2 short/auto, 1 no-consent)")
        print(f"  Reminders:     2 (1 pending, 1 sent)")
        print("─────────────────────────────────────────────────")
        print("\n🚀 Ready! Run the app with:")
        print('   uvicorn app.main:app --reload')
        print("   Then visit http://localhost:8000/docs")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
