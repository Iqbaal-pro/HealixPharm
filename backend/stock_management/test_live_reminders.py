"""
End-to-end live SMS reminder test.
Uses the EXACT project functions to:
  1. Create a test medicine
  2. Create a prescription (patient_id=32, 4 doses, 2 min window)
  3. Insert 4 pending reminders spaced 30s apart
  4. Loop and call process_pending_reminders() to send real SMS
"""
import sys, os, time
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from datetime import datetime, timedelta
from app.database.db import SessionLocal
from app.models.medicine import Medicine
from app.models.prescription import Prescription
from app.models.reminder import Reminder
from app.services.reminder_service import process_pending_reminders

PATIENT_ID = 32  # maneth

db = SessionLocal()

try:
    # ── Step 1: Use test medicine (already created ID=10) ───────
    med_id = 10
    med_name = "Paracetamol 500mg"
    print(f"[1/4] Using medicine: ID={med_id}, Name={med_name}")

    # ── Step 2: Create a prescription ─────────────────────────────
    now = datetime.utcnow()
    rx = Prescription(
        patient_id=PATIENT_ID,
        medicine_id=med_id,
        staff_id=1,
        uploaded_by_staff_id=1,
        dose_per_day=4,
        quantity_given=8,
        start_date=now,
        end_date=now + timedelta(minutes=2),
        reminder_type="TIME_BASED",
        first_dose_time=now,
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)
    print(f"[2/4] Prescription created: ID={rx.id}, Start={rx.start_date}, End={rx.end_date}")

    # ── Step 3: Create 4 pending reminders (every 30s) ────────────
    reminder_ids = []
    for i in range(4):
        r_time = now + timedelta(seconds=i * 30)
        r = Reminder(
            prescription_id=rx.id,
            reminder_time=r_time,
            status="pending",
            one_time=False,
            channel="sms",
            reminder_type="DOSE",
        )
        db.add(r)
        db.commit()
        db.refresh(r)
        reminder_ids.append(r.id)
        print(f"[3/4] Reminder #{i+1} created: ID={r.id}, Time={r_time.strftime('%H:%M:%S')}")

    print(f"\n--- All 4 reminders queued. Processing loop starting... ---\n")

    # ── Step 4: Process loop (runs every 10s for 2 minutes) ───────
    sent_count = 0
    end_time = time.time() + 150  # 2.5 min safety margin

    while time.time() < end_time:
        results = process_pending_reminders(db)
        for r in results:
            sent_count += 1
            status = "SENT" if r["success"] else "FAILED"
            print(f"  >> [{status}] Reminder {r['reminder_id']} | Patient: {r['patient']}, Medicine: {r['medicine']}")
            if r.get("error"):
                print(f"     Error: {r['error']}")

        if sent_count >= 4:
            print(f"\nAll 4 reminders processed!")
            break

        print(f"  ... waiting (sent so far: {sent_count}/4) ...")
        time.sleep(10)

    print(f"\n=== DONE: {sent_count} SMS sent to patient maneth (0750662454) ===")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
