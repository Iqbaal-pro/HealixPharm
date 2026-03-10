"""
Reminder Service – creates, processes, and sends reminders.
Handles both one-time (pharmacist checkbox) and recurring reminders.
"""
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.models.patient import Patient
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

    if not patient.consent:
        return {"success": False, "error": "Patient has not given consent"}

    # ─── Create one-time reminder row ───────────────────────────
    reminder = create_reminder(db, prescription_id, one_time=True)

    # ─── Send SMS immediately ───────────────────────────────────
    message = (
        f"Hi {patient.name}, this is a reminder from HealixPharm. "
        f"Please take your medicine: {prescription.medicine_name} "
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
        "medicine": prescription.medicine_name,
        "error": result.get("error")
    }


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

        # ── Build & send SMS ─────────────────────────────────────
        message = (
            f"Hi {patient.name}, refill reminder from HealixPharm: "
            f"Your medicine '{prescription.medicine_name}' is running low. "
            f"Please visit the pharmacy for a refill."
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
            "medicine": prescription.medicine_name,
            "success": sms_result["success"],
            "error": sms_result.get("error")
        })

    return results
