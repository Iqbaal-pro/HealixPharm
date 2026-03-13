from app.database.db import SessionLocal
from app.services.reminder_service import generate_schedule_reminders, process_pending_reminders
from app.models.reminder import Reminder
from app.models.prescription import Prescription
from app.models.patient import Patient
from datetime import datetime, timedelta

def test_deduplication():
    db = SessionLocal()
    rx_id = None
    try:
        # 1. Create a dummy prescription for testing
        print("1. Creating test prescription...")
        rx = Prescription(
            patient_id=21,
            medicine_id=7, # Panadol
            staff_id=1,
            uploaded_by_staff_id=1, # REQUIRED
            dose_per_day=1,
            quantity_given=5,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=5),
            reminder_type="TIME_BASED"
        )
        db.add(rx)
        db.commit()
        db.refresh(rx)
        rx_id = rx.id
        print(f"Rx ID: {rx_id}")

        print(f"\n2. Testing Generation Deduplication for Rx {rx_id}...")
        
        # First call
        generate_schedule_reminders(db, rx)
        count1 = db.query(Reminder).filter(Reminder.prescription_id == rx_id).count()
        print(f"Initial count: {count1}")

        # Second call (should skip all)
        generate_schedule_reminders(db, rx)
        count2 = db.query(Reminder).filter(Reminder.prescription_id == rx_id).count()
        print(f"Second count (should be the same): {count2}")

        if count1 == count2 and count1 > 0:
            print("SUCCESS: Generation deduplication works!")
        else:
            print(f"FAILURE: Duplicate reminders generated. (Final count: {count2})")

        # 3. Testing Concurrency Protection (Simulated)
        print("\n3. Testing Concurrency Protection...")
        # Mark one reminder as pending
        rem = db.query(Reminder).filter(Reminder.prescription_id == rx_id, Reminder.status == "pending").first()
        if rem:
            print(f"Testing lock on Reminder {rem.id}")
            
            # Reset remainder to pending for clean test
            db.query(Reminder).filter(Reminder.id == rem.id).update({"status": "pending"})
            db.commit()

            print("Simulating Worker A processing...")
            # We call process_pending_reminders once
            # It should mark it as processing then sent
            results = process_pending_reminders(db)
            sent_count = len([r for r in results if r['reminder_id'] == rem.id])
            print(f"Worker A processed {sent_count} reminder(s).")
            
            db.refresh(rem)
            print(f"Status after Worker A: {rem.status}")

            if rem.status == "sent":
                 print("Simulating Worker B processing...")
                 results_b = process_pending_reminders(db)
                 found_in_b = any(r['reminder_id'] == rem.id for r in results_b)
                 if not found_in_b:
                     print("SUCCESS: Concurrency protection works!")
                 else:
                     print("FAILURE: Worker B processed the same reminder.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        # Cleanup
        if rx_id:
            db.query(Reminder).filter(Reminder.prescription_id == rx_id).delete()
            db.query(Prescription).filter(Prescription.id == rx_id).delete()
            db.commit()
        db.close()

if __name__ == "__main__":
    test_deduplication()
