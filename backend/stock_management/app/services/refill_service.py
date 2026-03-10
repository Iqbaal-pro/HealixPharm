"""
Refill Service – calculates remaining days of medicine and determines
whether a refill reminder should be sent.
"""
import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.models.prescription import Prescription
from app.models.patient import Patient
from app.repositories.prescription_repo import PrescriptionRepository

# ─── Load threshold from .env ───────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
REFILL_THRESHOLD = int(os.getenv("REFILL_THRESHOLD", "3"))


def calculate_remaining_days(prescription: Prescription) -> float:
    """
    Calculate how many days of medicine the patient has left.

    Formula:
        remaining_days = (quantity_given / dose_per_day) - days_passed

    Returns a float; negative means medicine has already run out.
    """
    if prescription.dose_per_day <= 0:
        return float("inf")  # avoid division by zero

    total_days_supply = prescription.quantity_given / prescription.dose_per_day
    days_passed = (datetime.utcnow() - prescription.start_date).days
    remaining = total_days_supply - days_passed
    return remaining


def check_refill_needed(
    prescription: Prescription,
    threshold: int = None
) -> bool:
    """
    Return True if the prescription needs a refill reminder.
    Uses REFILL_THRESHOLD from .env (default 3 days).
    """
    if threshold is None:
        threshold = REFILL_THRESHOLD

    remaining = calculate_remaining_days(prescription)
    return remaining <= threshold


def get_eligible_prescriptions(db: Session) -> list:
    """
    Find all prescriptions that are:
      1. Marked as continuous / long-term
      2. Belong to patients who consented
      3. Running low on medicine (remaining_days <= threshold)

    Also includes prescriptions where quantity/dose > 7 days
    (priority medicine heuristic).
    """
    repo = PrescriptionRepository(db)

    # Get all continuous prescriptions for consented patients
    continuous_prescriptions = repo.get_continuous_for_consented_patients()

    eligible = []
    for rx in continuous_prescriptions:
        if check_refill_needed(rx):
            eligible.append(rx)

    # Also check non-continuous prescriptions with large supply (>7 days)
    # These are auto-detected as potentially long-term
    all_prescriptions = repo.get_all()
    for rx in all_prescriptions:
        if rx in eligible:
            continue  # already included
        if not rx.is_continuous and rx.dose_per_day > 0:
            total_days = rx.quantity_given / rx.dose_per_day
            if total_days > 7 and check_refill_needed(rx):
                # Verify that the patient has consent
                patient = (
                    db.query(Patient)
                    .filter(Patient.id == rx.patient_id, Patient.consent == True)
                    .first()
                )
                if patient:
                    eligible.append(rx)

    return eligible
