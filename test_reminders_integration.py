import os
import sys
from datetime import datetime, timezone, timedelta

# Setup environment and path
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "Angel@0602!")
os.environ.setdefault("DB_NAME", "healixpharm")
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))

from app.database.connection import SessionLocal
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.issued_item import IssuedItem
from app.models.reminder import Reminder
from app.services.reminder_service import ReminderService

def run_reminders_test():
    db = SessionLocal()
    service = ReminderService(db)
    
    try:
        print("\n--- Reminders Integration Flow Test ---")
        
        # 1. Create a test patient (with encryption)
        print("\nCreating test patient...")
        test_patient = Patient(
            name="Reminder Test Patient", 
            phone_number="+94719998887", 
            date_of_birth="1985-05-05",
            language="en"
        )
        db.add(test_patient)
        db.commit()
        db.refresh(test_patient)
        
        # 2. Create a test prescription for REFILL reminder
        print("Creating refill test prescription...")
        refill_presc = Prescription(
            patient_id=test_patient.id,
            medicine_name="Refill Test Drug",
            total_quantity=10,
            dose_per_day=2,
            interval_hours=24,
            start_time=datetime.now(timezone.utc)
        )
        db.add(refill_presc)
        db.commit()
        db.refresh(refill_presc)
        
        # Issue some stock (8 items issued, 2 per day -> 4 days left. Threshold is 3. Should NOT trigger yet)
        print("Issuing initial stock (4 days left)...")
        issue1 = IssuedItem(
            prescription_id=refill_presc.id,
            medicine_name="Refill Test Drug",
            quantity_issued=8
        )
        db.add(issue1)
        db.commit()
        
        # 3. Test Refill Reminder (Threshold 5 days - should TRIGGER)
        print("\n--- Testing Refill Reminders ---")
        created_count = service.check_and_create_reminders(threshold_days=5)
        print(f"Refill Reminders Created: {created_count}")
        
        # Verify in DB
        reminder = db.query(Reminder).filter(Reminder.prescription_id == refill_presc.id).first()
        if reminder:
            print(f"SUCCESS: Refill reminder created in DB. Status: {reminder.status}")
        else:
            print("FAILED: Refill reminder NOT created in DB.")

        # 4. Create a test prescription for DOSE reminder
        print("\nCreating dose test prescription...")
        dose_presc = Prescription(
            patient_id=test_patient.id,
            medicine_name="Dose Test Drug",
            dose_quantity=1,
            interval_hours=8,
            meal_timing="after meal",
            start_time=datetime.now(timezone.utc)
        )
        db.add(dose_presc)
        db.commit()
        db.refresh(dose_presc)
        
        # Issue stock for dose reminder
        issue2 = IssuedItem(
            prescription_id=dose_presc.id,
            medicine_name="Dose Test Drug",
            quantity_issued=24
        )
        db.add(issue2)
        db.commit()
        
        # 5. Test Dose Reminder
        print("--- Testing Dose Reminders ---")
        dose_reminder = service.create_dose_reminder_from_stock(dose_presc.id)
        
        # Verify in DB
        db_dose_reminder = db.query(Reminder).filter(Reminder.id == dose_reminder.id).first()
        if db_dose_reminder:
            print(f"SUCCESS: Dose reminder created in DB. Time: {db_dose_reminder.reminder_time}")
        else:
            print("FAILED: Dose reminder NOT created in DB.")

        # Clean up
        print("\nCleaning up test data...")
        db.delete(db_dose_reminder)
        db.delete(reminder)
        db.delete(issue2)
        db.delete(issue1)
        db.delete(dose_presc)
        db.delete(refill_presc)
        db.delete(test_patient)
        db.commit()
        print("SUCCESS: Recovery test finished!")

    except Exception as e:
        print(f"Test Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_reminders_test()
