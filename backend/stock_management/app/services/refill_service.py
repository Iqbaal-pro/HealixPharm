from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.prescription import Prescription
from app.models.patient import Patient
from app.repositories.prescription_repo import PrescriptionRepository

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
    Uses REFILL_THRESHOLD from settings (default 3 days).
    """
    if threshold is None:
        threshold = settings.REFILL_THRESHOLD

    # If we have an explicit end_date, use it for the 3-day rule
    if prescription.end_date:
        days_until_end = (prescription.end_date - datetime.utcnow()).days
        return days_until_end <= threshold

    remaining = calculate_remaining_days(prescription)
    return remaining <= threshold


def get_eligible_prescriptions(db: Session) -> list:
    """
    Find all prescriptions that are running low on medicine.
    """
    repo = PrescriptionRepository(db)

    # Get all continuous prescriptions for consented patients
    continuous_prescriptions = repo.get_continuous_for_consented_patients()

    eligible = []
    for rx in continuous_prescriptions:
        if check_refill_needed(rx):
            eligible.append(rx)

    # Also check non-continuous prescriptions with large supply (>7 days)
    all_prescriptions = repo.get_all()
    for rx in all_prescriptions:
        if rx in eligible:
            continue
        if not rx.is_continuous and rx.dose_per_day > 0:
            total_days = rx.quantity_given / rx.dose_per_day
            if total_days > 7 and check_refill_needed(rx):
                patient = (
                    db.query(Patient)
                    .filter(Patient.id == rx.patient_id, Patient.consent == True)
                    .first()
                )
                if patient:
                    eligible.append(rx)

    return eligible
