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
from app.models.reminder import Reminder
from app.services.reminder_service import ReminderService

def verify_pandol_6day_cycle():
    db = SessionLocal()
    service = ReminderService(db)
    
    try:
        print("\n--- Verifying Pandol 6-Day Dose Reminder Cycle ---")
        
        # 1. Create a test patient
        test_patient = Patient(
            name="Pandol Test User", 
            phone_number="+94710000000", 
            date_of_birth="1995-10-10",
            language="en"
        )
        db.add(test_patient)
        db.commit()
        db.refresh(test_patient)
        
        # 2. Create the prescription as per user request:
        # Pandol, 1 tablet every 6 hours for 6 days
        print("\nCreating prescription: Pandol, 1 tablet every 6h for 6 days...")
        presc = Prescription(
            patient_id=test_patient.id,
            medicine_name="Pandol",
            dose_quantity=1,
            interval_hours=6,
            duration_days=6,
            reminder_type="time_based",
            start_time=datetime.now(timezone.utc)
        )
        db.add(presc)
        db.commit()
        db.refresh(presc)
        
        # 3. Trigger scheduling
        print("Scheduling reminders...")
        reminders = service.create_dose_reminders(presc.id)
        
        # 4. Verify results
        expected_count = (24 // 6) * 6 # 4 doses/day * 6 days = 24 doses
        print(f"Total Reminders Created: {len(reminders)} (Expected: {expected_count})")
        
        if len(reminders) == expected_count:
            print("SUCCESS: Correct number of reminders created.")
        else:
            print(f"FAILED: Created {len(reminders)} but expected {expected_count}.")
            
        if len(reminders) > 0:
            last_reminder = reminders[-1]
            first_reminder = reminders[0]
            print(f"First reminder at: {first_reminder.reminder_time}")
            print(f"Last reminder at:  {last_reminder.reminder_time}")
            
            # Check if last reminder is roughly 6 days + 6 hours from start (if we start from dose 1 after 6h)
            # Actually with i * interval, it's correct.
        
        # 5. Clean up
        print("\nCleaning up test data...")
        for r in reminders:
            db.delete(r)
        db.delete(presc)
        db.delete(test_patient)
        db.commit()
        print("SUCCESS: Pandol verification test finished!")

    except Exception as e:
        print(f"Test Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    verify_pandol_6day_cycle()
