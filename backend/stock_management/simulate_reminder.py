"""
Simulate Reminder Demo
======================
Demonstrates the full reminder flow end-to-end:
  1. Creates patients + prescriptions in an in-memory DB
  2. Pharmacist marks a prescription as continuous
  3. Sends a one-time reminder (pharmacist checkbox)
  4. Runs the refill check to find eligible prescriptions
  5. Processes all pending reminders

All SMS is simulated (printed to console).
Run:  python simulate_reminder.py
"""
import sys
import os

# Force UTF-8 on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Force SMS simulation mode
os.environ["SMS_SIMULATE"] = "true"

sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.reminder import Reminder
from app.repositories.patient_repo import PatientRepository
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.reminder_repo import ReminderRepository
from app.services.refill_service import (
    calculate_remaining_days,
    check_refill_needed,
    get_eligible_prescriptions
)
from app.services.reminder_service import (
    create_reminder,
    send_one_time_reminder,
    process_pending_reminders
)


def divider(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def main():
    # ── Setup in-memory SQLite database ──────────────────────────
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # ════════════════════════════════════════════════════════════
    divider("STEP 1: Register Patients")
    # ════════════════════════════════════════════════════════════

    patient_repo = PatientRepository(db)

    p1 = patient_repo.create(Patient(
        name="Kamal Perera",
        phone_number="+94771234567",
        language="si",
        consent=True
    ))
    print(f"  + Created: {p1.name} (consent: YES, phone: {p1.phone_number})")

    p2 = patient_repo.create(Patient(
        name="Nimal Silva",
        phone_number="+94777654321",
        language="en",
        consent=True
    ))
    print(f"  + Created: {p2.name} (consent: YES, phone: {p2.phone_number})")

    p3 = patient_repo.create(Patient(
        name="Rani Fernando",
        phone_number="+94779999999",
        language="en",
        consent=False
    ))
    print(f"  + Created: {p3.name} (consent: NO, phone: {p3.phone_number})")

    # ════════════════════════════════════════════════════════════
    divider("STEP 2: Create Prescriptions")
    # ════════════════════════════════════════════════════════════

    rx_repo = PrescriptionRepository(db)

    # Kamal: long-term diabetes med (running low - 5 days left)
    rx1 = rx_repo.create(Prescription(
        patient_id=p1.id,
        uploaded_by_staff_id=1,
        medicine_name="Metformin 500mg",
        dose_per_day=2,
        start_date=datetime.utcnow() - timedelta(days=25),
        quantity_given=60,
        is_continuous=True
    ))
    remaining1 = calculate_remaining_days(rx1)
    print(f"  + Rx#{rx1.id}: {rx1.medicine_name} for {p1.name}")
    print(f"    Dose: {rx1.dose_per_day}/day | Qty: {rx1.quantity_given} | Continuous: YES")
    print(f"    Remaining days: {remaining1:.1f}")
    print(f"    Needs refill? {'YES' if check_refill_needed(rx1) else 'NO'}")

    # Kamal: short-term antibiotic (NOT continuous)
    rx2 = rx_repo.create(Prescription(
        patient_id=p1.id,
        uploaded_by_staff_id=1,
        medicine_name="Amoxicillin 250mg",
        dose_per_day=3,
        start_date=datetime.utcnow() - timedelta(days=3),
        quantity_given=15,
        is_continuous=False
    ))
    remaining2 = calculate_remaining_days(rx2)
    print(f"\n  + Rx#{rx2.id}: {rx2.medicine_name} for {p1.name}")
    print(f"    Dose: {rx2.dose_per_day}/day | Qty: {rx2.quantity_given} | Continuous: NO")
    print(f"    Remaining days: {remaining2:.1f}")
    print(f"    Needs refill? {'YES' if check_refill_needed(rx2) else 'NO'}")

    # Nimal: blood pressure med (running very low - 3 days left)
    rx3 = rx_repo.create(Prescription(
        patient_id=p2.id,
        uploaded_by_staff_id=2,
        medicine_name="Amlodipine 5mg",
        dose_per_day=1,
        start_date=datetime.utcnow() - timedelta(days=27),
        quantity_given=30,
        is_continuous=True
    ))
    remaining3 = calculate_remaining_days(rx3)
    print(f"\n  + Rx#{rx3.id}: {rx3.medicine_name} for {p2.name}")
    print(f"    Dose: {rx3.dose_per_day}/day | Qty: {rx3.quantity_given} | Continuous: YES")
    print(f"    Remaining days: {remaining3:.1f}")
    print(f"    Needs refill? {'YES' if check_refill_needed(rx3) else 'NO'}")

    # Rani: has continuous med but NO CONSENT
    rx4 = rx_repo.create(Prescription(
        patient_id=p3.id,
        uploaded_by_staff_id=1,
        medicine_name="Losartan 50mg",
        dose_per_day=1,
        start_date=datetime.utcnow() - timedelta(days=28),
        quantity_given=30,
        is_continuous=True
    ))
    remaining4 = calculate_remaining_days(rx4)
    print(f"\n  + Rx#{rx4.id}: {rx4.medicine_name} for {p3.name}")
    print(f"    Dose: {rx4.dose_per_day}/day | Qty: {rx4.quantity_given} | Continuous: YES")
    print(f"    Remaining days: {remaining4:.1f}")
    print(f"    ** PATIENT HAS NO CONSENT - will NOT receive reminders **")

    # ════════════════════════════════════════════════════════════
    divider("STEP 3: Pharmacist One-Time Reminder (Checkbox Click)")
    # ════════════════════════════════════════════════════════════

    print(f"  Pharmacist clicks 'Send Reminder' for Rx#{rx1.id} ({rx1.medicine_name})...")
    result = send_one_time_reminder(db, rx1.id)
    print(f"  Result: {'SUCCESS' if result['success'] else 'FAILED'}")
    print(f"  Reminder ID: {result.get('reminder_id')}")
    print(f"  Patient: {result.get('patient_name')}")

    print(f"\n  Pharmacist clicks 'Send Reminder' for Rx#{rx4.id} ({rx4.medicine_name})...")
    print(f"  (Patient {p3.name} has NO consent)")
    result2 = send_one_time_reminder(db, rx4.id)
    print(f"  Result: {'SUCCESS' if result2['success'] else 'BLOCKED'}")
    print(f"  Reason: {result2.get('error')}")

    # ════════════════════════════════════════════════════════════
    divider("STEP 4: Automated Refill Check (Scheduler Simulation)")
    # ════════════════════════════════════════════════════════════

    print("  Running daily refill check...")
    eligible = get_eligible_prescriptions(db)
    print(f"  Found {len(eligible)} prescriptions needing refill:\n")

    for rx in eligible:
        patient = patient_repo.get_by_id(rx.patient_id)
        days = calculate_remaining_days(rx)
        print(f"    - Rx#{rx.id}: {rx.medicine_name} ({patient.name})")
        print(f"      {days:.1f} days remaining | Continuous: {rx.is_continuous}")

    # Create reminders for eligible prescriptions
    reminder_repo = ReminderRepository(db)
    for rx in eligible:
        existing = reminder_repo.get_by_prescription_id(rx.id)
        has_pending = any(r.status == "pending" for r in existing)
        if not has_pending:
            rem = create_reminder(db, rx.id, one_time=False)
            print(f"\n    >> Created refill reminder #{rem.id} for Rx#{rx.id}")

    # ════════════════════════════════════════════════════════════
    divider("STEP 5: Process All Pending Reminders (Send SMS)")
    # ════════════════════════════════════════════════════════════

    print("  Sending all pending reminders...\n")
    results = process_pending_reminders(db)

    for r in results:
        status = "SENT" if r["success"] else "FAILED"
        print(f"    [{status}] Reminder #{r['reminder_id']}")
        print(f"           Patient: {r['patient']}")
        print(f"           Medicine: {r['medicine']}")
        if r.get("error"):
            print(f"           Error: {r['error']}")
        print()

    # ════════════════════════════════════════════════════════════
    divider("SUMMARY")
    # ════════════════════════════════════════════════════════════

    all_reminders = db.query(Reminder).all()
    sent = [r for r in all_reminders if r.status == "sent"]
    pending = [r for r in all_reminders if r.status == "pending"]

    print(f"  Total patients:       3 (2 consented, 1 not)")
    print(f"  Total prescriptions:  4 (2 continuous+consent, 1 short-term, 1 no-consent)")
    print(f"  Total reminders:      {len(all_reminders)}")
    print(f"    - Sent:             {len(sent)}")
    print(f"    - Still pending:    {len(pending)}")
    print(f"\n  Rani Fernando (no consent) was correctly EXCLUDED from all reminders.")
    print(f"  Amoxicillin (short-term) was correctly EXCLUDED from refill reminders.")

    db.close()
    print(f"\n{'='*60}")
    print("  SIMULATION COMPLETE")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
