from datetime import timedelta
from app.repositories.issued_item_repo import IssuedItemRepository
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.repositories import save_reminder
from app.models.reminder import Reminder
from app.Service.scheduler import scheduler


def send_sms(reminder_id: int):
    print(f"📩 SMS SENT | reminder_id = {reminder_id}")


def create_one_reminder_from_stock(db, prescription_id: int):
    # 1️⃣ Fetch prescription OBJECT
    prescription_repo = PrescriptionRepository(db)
    prescription = prescription_repo.get_by_id(prescription_id)

    if not prescription:
        raise Exception("Prescription not found")

    # 2️⃣ Read issued stock
    issued_repo = IssuedItemRepository(db)
    issued_items = issued_repo.get_by_prescription_id(prescription_id)

    if not issued_items:
        raise Exception("No medicine issued for this prescription")

    # 3️⃣ Calculate total issued quantity
    total_issued = sum(item.quantity_issued for item in issued_items)

    # 4️⃣ Calculate doses per day
    doses_per_day = 24 // prescription.interval_hours

    # 5️⃣ Calculate total days (not used yet, but correct)
    total_days = total_issued // (doses_per_day * prescription.dose_quantity)

    # 6️⃣ Create ONE reminder (first dose only)
    reminder_time = prescription.start_time + timedelta(
        hours=prescription.interval_hours
    )

    reminder = Reminder(
        prescription_id=prescription.id,
        medicine_name=prescription.medicine_name,
        dose_quantity=prescription.dose_quantity,
        meal_timing=prescription.meal_timing,
        reminder_time=reminder_time,
        status="pending"
    )

    reminder = save_reminder(db, reminder)

    # 7️⃣ Schedule SMS using APScheduler
    scheduler.add_job(
        send_sms,
        trigger="date",
        run_date=reminder.reminder_time,
        args=[reminder.id]
    )

    return reminder
