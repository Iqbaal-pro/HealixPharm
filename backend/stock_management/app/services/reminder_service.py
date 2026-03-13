"""
Reminder Service – creates, processes, and sends reminders.
Handles both one-time (pharmacist checkbox) and recurring reminders.
"""
import logging
<<<<<<< HEAD
from datetime import datetime, timedelta, time
=======
from datetime import datetime, timedelta
>>>>>>> 4dbb78e3c9a06363b9242c2c3f5d630ffabe2351
from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.models.patient import Patient
<<<<<<< HEAD
from app.models.prescription import Prescription
from app.models.medicine import Medicine
=======
from app.models.issued_item import IssuedItem
>>>>>>> 4dbb78e3c9a06363b9242c2c3f5d630ffabe2351
from app.repositories.reminder_repo import ReminderRepository
from app.repositories.prescription_repo import PrescriptionRepository
from app.services.sms_service import send_sms

logger = logging.getLogger(__name__)


def create_reminder(
    db: Session,
    prescription_id: int,
    one_time: bool = False
) -> Reminder:
    """
    Insert a new reminder row in the REMINDERS table.

    Args:
        db: database session
        prescription_id: which prescription this reminder is for
        one_time: True if this is a one-time pharmacist-triggered reminder
    """
    reminder_repo = ReminderRepository(db)

    reminder = Reminder(
        prescription_id=prescription_id,
        reminder_time=datetime.utcnow(),
        channel="sms",
        status="pending",
        one_time=one_time
    )
    return reminder_repo.create(reminder)


def send_one_time_reminder(db: Session, prescription_id: int) -> dict:
    """
    Pharmacist clicks the checkbox for a one-time reminder:
      1. Look up the prescription and patient
      2. Send SMS immediately (no persistent DB scheduling)
      3. Log the attempt in REMINDER_LOGS

    Returns a result dict with success/failure info.
    """
    rx_repo = PrescriptionRepository(db)
    reminder_repo = ReminderRepository(db)

    # ─── Fetch prescription ─────────────────────────────────────
    prescription = rx_repo.get_by_id(prescription_id)
    if not prescription:
        return {"success": False, "error": "Prescription not found"}

    # ─── Fetch patient for consent + phone number ───────────────
    patient = (
        db.query(Patient)
        .filter(Patient.id == prescription.patient_id)
        .first()
    )
    if not patient:
        return {"success": False, "error": "Patient not found"}

    # ─── Fetch medicine name ────────────────────────────────────
    medicine = db.query(Medicine).filter(Medicine.id == prescription.medicine_id).first()
    med_name = medicine.name if medicine else "your medicine"

    # ─── Create one-time reminder row ───────────────────────────
    reminder = create_reminder(db, prescription_id, one_time=True)

    # ─── Send SMS immediately ───────────────────────────────────
    message = (
        f"Hi {patient.name}, this is a reminder from HealixPharm. "
        f"Please take your medicine: {med_name} "
        f"({prescription.dose_per_day} dose(s)/day). "
        f"Contact your pharmacy if you need a refill."
    )
    result = send_sms(patient.phone_number, message)

    # ─── Log the attempt ────────────────────────────────────────
    if result["success"]:
        reminder_repo.mark_sent(reminder.id)
        reminder_repo.log_attempt(
            reminder.id, "sms", "success"
        )
    else:
        reminder_repo.log_attempt(
            reminder.id, "sms", "failure", result.get("error")
        )

    return {
        "success": result["success"],
        "reminder_id": reminder.id,
        "patient_name": patient.name,
        "medicine": med_name,
        "error": result.get("error")
    }


def generate_schedule_reminders(db: Session, rx: Prescription):
    """
    Generate the full schedule of reminders for a prescription.
    Creates entries in the REMINDERS table from rx.start_date to rx.end_date.
    """
    from datetime import time

    logger.info(f"[REMINDER_GEN] Generating schedule for Rx {rx.id} | Type: {rx.reminder_type}")
    
    current_date = rx.start_date.date()
    end_date = rx.end_date.date()
    
    # 1. Refill Reminder (3 days before end_date)
    refill_date = rx.end_date - timedelta(days=3)
    # Ensure refill reminder isn't in the past and doesn't already exist
    reminder_repo = ReminderRepository(db)
    if refill_date > datetime.utcnow():
        if not reminder_repo.reminder_exists(rx.id, refill_date, "REFILL"):
            refill_reminder = Reminder(
                prescription_id=rx.id,
                reminder_time=refill_date,
                status="pending",
                one_time=False,
                channel="sms",
                reminder_type="REFILL"
            )
            db.add(refill_reminder)
            logger.info(f"[REMINDER_GEN] Queued refill reminder for {refill_date}")
        else:
            logger.info(f"[REMINDER_GEN] Refill reminder already exists for Rx {rx.id}")

    # 2. Daily Medication Reminders
    while current_date <= end_date:
        reminder_times = []
        
        if rx.reminder_type == "TIME_BASED":
            # Interval = 24 / dose_per_day
            interval_hours = 24 / (rx.dose_per_day if rx.dose_per_day > 0 else 1)
            
            # Start from first_dose_time on current_date
            # Note: first_dose_time carries the time component
            base_time = rx.first_dose_time.time() if rx.first_dose_time else time(8, 0)
            base_dt = datetime.combine(current_date, base_time)
            
            for i in range(rx.dose_per_day):
                r_time = base_dt + timedelta(hours=i * interval_hours)
                # Only add if it's on the correct date and in the future
                if r_time.date() == current_date and r_time > datetime.utcnow():
                    reminder_times.append(r_time)

        elif rx.reminder_type == "MEAL_BASED":
            # Meal Times: Breakfast (07:30), Lunch (13:00), Dinner (19:30)
            meal_schedules = {
                "BREAKFAST": time(7, 30),
                "LUNCH": time(13, 0),
                "DINNER": time(19, 30)
            }
            
            selected_meals = [m.strip().upper() for m in rx.meal_types.split(",")] if rx.meal_types else []
            
            for meal in selected_meals:
                if meal in meal_schedules:
                    m_time = meal_schedules[meal]
                    dt = datetime.combine(current_date, m_time)
                    
                    # Offset if BEFORE_MEAL (-30 mins)
                    if rx.meal_instruction == "BEFORE_MEAL":
                        dt -= timedelta(minutes=30)
                    
                    if dt > datetime.utcnow():
                        reminder_times.append(dt)

        # Bulk add for the day
        for t in reminder_times:
            if not reminder_repo.reminder_exists(rx.id, t, "DOSE"):
                r = Reminder(
                    prescription_id=rx.id,
                    reminder_time=t,
                    status="pending",
                    one_time=False,
                    channel="sms",
                    reminder_type="DOSE"
                )
                db.add(r)
            else:
                logger.debug(f"Reminder for {t} already exists for Rx {rx.id}")
            
        current_date += timedelta(days=1)

    logger.info(f"[REMINDER_GEN] Finished queuing reminders for Rx {rx.id}")


def process_pending_reminders(db: Session) -> list:
    """
    Process all pending reminders:
      1. For each pending reminder, look up patient + prescription
      2. Skip if patient revoked consent
      3. Send SMS, mark as sent, log attempt
      4. For one-time reminders, status='sent' prevents re-sending

    Returns a list of result dicts.
    """
    reminder_repo = ReminderRepository(db)
    rx_repo = PrescriptionRepository(db)
    results = []

    pending = reminder_repo.get_pending()
    logger.info(f"Processing {len(pending)} pending reminders")

    for reminder in pending:
        # ATOMIC LOCK: Try to mark as 'processing'. If someone else got it, skip.
        if not reminder_repo.mark_processing(reminder.id):
            continue

        # ── Fetch prescription + patient ─────────────────────────
        prescription = rx_repo.get_by_id(reminder.prescription_id)
        if not prescription:
            logger.warning(
                f"Reminder {reminder.id}: prescription {reminder.prescription_id} not found"
            )
            continue

        patient = (
            db.query(Patient)
            .filter(Patient.id == prescription.patient_id)
            .first()
        )
        if not patient:
            logger.warning(f"Reminder {reminder.id}: patient not found")
            continue

        # ── Skip if consent revoked ──────────────────────────────
        if not patient.consent:
            logger.info(
                f"Reminder {reminder.id}: skipping – patient {patient.name} revoked consent"
            )
            continue

        # ── Fetch medicine ───────────────────────────────────────
        medicine = db.query(Medicine).filter(Medicine.id == prescription.medicine_id).first()
        med_name = medicine.name if medicine else "your medicine"

        # ── Build & send SMS ─────────────────────────────────────
        if reminder.reminder_type == "REFILL":
            message = (
                f"Hi {patient.name}, this is HealixPharm. Your medicine '{med_name}' "
                f"is near to finish. Do you need a refill?"
            )
        else:
            message = (
                f"Hi {patient.name}, this is your reminder from HealixPharm. "
                f"Please take your medicine: {med_name}."
            )
            
        sms_result = send_sms(patient.phone_number, message)

        # ── Update status & log ──────────────────────────────────
        if sms_result["success"]:
            reminder_repo.mark_sent(reminder.id)
            reminder_repo.log_attempt(reminder.id, "sms", "success")
        else:
            reminder_repo.log_attempt(
                reminder.id, "sms", "failure", sms_result.get("error")
            )

        results.append({
            "reminder_id": reminder.id,
            "patient": patient.name,
            "medicine": med_name,
            "success": sms_result["success"],
            "error": sms_result.get("error")
        })

    return results


def schedule_dose_reminders(db: Session, prescription_id: int):
    """
    Migrated from healix_extra:
    Creates dose-based reminders (e.g., every 8 hours) based on issued stock.
    """
    rx_repo = PrescriptionRepository(db)
    reminder_repo = ReminderRepository(db)
    
    prescription = rx_repo.get_by_id(prescription_id)
    if not prescription or not prescription.interval_hours or not prescription.dose_quantity:
        logger.warning(f"Skipping dose scheduling for Rx {prescription_id}: Missing dose info")
        return None

    # 1. Check issued stock
    issued_items = db.query(IssuedItem).filter(
        IssuedItem.prescription_id == prescription_id
    ).all()
    
    if not issued_items:
        logger.warning(f"No issued stock found for Rx {prescription_id}")
        return None

    total_issued = sum(item.quantity_issued for item in issued_items)
    
    # 2. Calculate how many doses are covered by this stock
    total_doses = total_issued // prescription.dose_quantity
    
    if total_doses <= 0:
        return None

    # 3. Schedule reminders
    # For now, we follow healix_extra's lead and just schedule the NEXT one
    # If there are already pending reminders, we don't duplicate
    existing = reminder_repo.get_by_prescription_id(prescription_id)
    if any(r.status == "pending" for r in existing):
        return None

    # Calculate next time: if no reminders sent, start_time + interval
    # else, last_reminder_time + interval
    last_reminder = (
        db.query(Reminder)
        .filter(Reminder.prescription_id == prescription_id)
        .order_by(Reminder.reminder_time.desc())
        .first()
    )

    if last_reminder:
        next_time = last_reminder.reminder_time + timedelta(hours=prescription.interval_hours)
    else:
        # First dose reminder
        base_time = prescription.start_time or prescription.created_at
        next_time = base_time + timedelta(hours=prescription.interval_hours)

    # Don't schedule if next_time is too far in the past or in the future
    if next_time < datetime.utcnow():
        # If missed, set to now + a small buffer or catch up?
        # Healix_extra logic just uses the calculation.
        next_time = datetime.utcnow() + timedelta(minutes=5)

    reminder = Reminder(
        prescription_id=prescription_id,
        reminder_time=next_time,
        status="pending",
        one_time=False
    )
    
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    
    logger.info(f"Scheduled dose reminder for Rx {prescription_id} at {next_time}")
    return reminder
