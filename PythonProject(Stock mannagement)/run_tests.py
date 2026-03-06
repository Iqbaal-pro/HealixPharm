"""
Standalone verification script - runs all tests without pytest.
Tests: refill logic, reminder creation, consent handling.
"""
import sys
import os

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.reminder import Reminder
from app.services.refill_service import calculate_remaining_days, check_refill_needed, get_eligible_prescriptions
from app.services.reminder_service import create_reminder, send_one_time_reminder, process_pending_reminders

# --- Setup in-memory database ---
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

passed = 0
failed = 0


def test(name, condition):
    global passed, failed
    if condition:
        print(f"  [PASS] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name}")
        failed += 1


def fresh_db():
    return Session()


# ================================================================
print("\n=== TEST GROUP 1: Refill Logic ===")
# ================================================================

# Test 1: Full supply
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=2, start_date=datetime.utcnow(), quantity_given=60
)
remaining = calculate_remaining_days(rx)
test("Full supply -> 30 days remaining", remaining == 30.0)

# Test 2: Halfway through
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=1, start_date=datetime.utcnow() - timedelta(days=10),
    quantity_given=20
)
remaining = calculate_remaining_days(rx)
test("Halfway -> 10 days remaining", remaining == 10.0)

# Test 3: Supply exhausted
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=2, start_date=datetime.utcnow() - timedelta(days=20),
    quantity_given=30
)
remaining = calculate_remaining_days(rx)
test("Exhausted -> -5 days", remaining == -5.0)

# Test 4: Zero dose_per_day
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=0, start_date=datetime.utcnow(), quantity_given=10
)
remaining = calculate_remaining_days(rx)
test("Zero dose -> infinity", remaining == float("inf"))

# Test 5: Below threshold
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=1, start_date=datetime.utcnow() - timedelta(days=8),
    quantity_given=10
)
test("Below threshold -> needs refill", check_refill_needed(rx, threshold=3) is True)

# Test 6: Above threshold
rx = Prescription(
    patient_id=1, uploaded_by_staff_id=1, medicine_name="TestMed",
    dose_per_day=1, start_date=datetime.utcnow() - timedelta(days=5),
    quantity_given=20
)
test("Above threshold -> no refill", check_refill_needed(rx, threshold=3) is False)


# ================================================================
print("\n=== TEST GROUP 2: Reminder Service ===")
# ================================================================

db = fresh_db()

# Create patient with consent
p1 = Patient(name="Test Patient", phone_number="+94770000000", consent=True)
db.add(p1)
db.commit()
db.refresh(p1)

rx1 = Prescription(
    patient_id=p1.id, uploaded_by_staff_id=1, medicine_name="Metformin",
    dose_per_day=2, start_date=datetime.utcnow(), quantity_given=60,
    is_continuous=True
)
db.add(rx1)
db.commit()
db.refresh(rx1)

# Test 7: Create reminder
reminder = create_reminder(db, rx1.id, one_time=False)
test("Create reminder -> pending", reminder.status == "pending")
test("Create reminder -> has ID", reminder.id is not None)
test("Create reminder -> not one-time", reminder.one_time is False)

# Test 8: One-time reminder
reminder2 = create_reminder(db, rx1.id, one_time=True)
test("One-time flag -> True", reminder2.one_time is True)

# Test 9: Send one-time with consent
result = send_one_time_reminder(db, rx1.id)
test("One-time SMS -> success", result["success"] is True)
test("Returns patient name", result["patient_name"] == "Test Patient")

# Test 10: Send one-time fails without consent
p2 = Patient(name="No Consent", phone_number="+94771111111", consent=False)
db.add(p2)
db.commit()
db.refresh(p2)

rx2 = Prescription(
    patient_id=p2.id, uploaded_by_staff_id=1, medicine_name="Aspirin",
    dose_per_day=1, start_date=datetime.utcnow(), quantity_given=10
)
db.add(rx2)
db.commit()
db.refresh(rx2)

result2 = send_one_time_reminder(db, rx2.id)
test("No consent -> SMS blocked", result2["success"] is False)
test("Error mentions consent", "consent" in result2["error"].lower())

# Test 11: Invalid prescription
result3 = send_one_time_reminder(db, 99999)
test("Invalid Rx -> fails", result3["success"] is False)

db.close()


# ================================================================
print("\n=== TEST GROUP 3: Consent Filtering ===")
# ================================================================

db = fresh_db()

p_consent = Patient(name="Consented", phone_number="+94772222222", consent=True)
p_no = Patient(name="No Consent", phone_number="+94773333333", consent=False)
db.add_all([p_consent, p_no])
db.commit()
db.refresh(p_consent)
db.refresh(p_no)

# Continuous prescription for consented patient (low supply)
rx_eligible = Prescription(
    patient_id=p_consent.id, uploaded_by_staff_id=1, medicine_name="Eligible",
    dose_per_day=1, start_date=datetime.utcnow() - timedelta(days=28),
    quantity_given=30, is_continuous=True
)
# Continuous prescription for non-consented patient
rx_blocked = Prescription(
    patient_id=p_no.id, uploaded_by_staff_id=1, medicine_name="Blocked",
    dose_per_day=1, start_date=datetime.utcnow() - timedelta(days=28),
    quantity_given=30, is_continuous=True
)
db.add_all([rx_eligible, rx_blocked])
db.commit()
db.refresh(rx_eligible)
db.refresh(rx_blocked)

eligible = get_eligible_prescriptions(db)
eligible_ids = [e.id for e in eligible]

test("Consented patient -> eligible", rx_eligible.id in eligible_ids)
test("No consent -> NOT eligible", rx_blocked.id not in eligible_ids)

db.close()


# ================================================================
print("\n=== TEST GROUP 4: Process Pending Reminders ===")
# ================================================================

db = fresh_db()

p = Patient(name="Process Test", phone_number="+94774444444", consent=True)
db.add(p)
db.commit()
db.refresh(p)

rx = Prescription(
    patient_id=p.id, uploaded_by_staff_id=1, medicine_name="ProcessMed",
    dose_per_day=1, start_date=datetime.utcnow(), quantity_given=30,
    is_continuous=True
)
db.add(rx)
db.commit()
db.refresh(rx)

rem = Reminder(
    prescription_id=rx.id, reminder_time=datetime.utcnow(),
    channel="sms", status="pending", one_time=False
)
db.add(rem)
db.commit()
db.refresh(rem)

results = process_pending_reminders(db)
test("Processed at least 1 reminder", len(results) >= 1)
sent_ids = [r["reminder_id"] for r in results if r["success"]]
test("Reminder was sent", rem.id in sent_ids)

db.close()


# ================================================================
print(f"\n{'='*50}")
print(f"RESULTS: {passed} passed, {failed} failed, {passed+failed} total")
print(f"{'='*50}")

if failed > 0:
    sys.exit(1)
else:
    print("All tests passed!")
    sys.exit(0)
