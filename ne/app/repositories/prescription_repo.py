from sqlalchemy.orm import Session
from app.models.prescription import Prescription
from datetime import datetime, timezone


class PrescriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, prescription_id: int):
        # [Dose Reminders + Refill Reminders] — fetch one prescription by its primary key
        return (
            self.db.query(Prescription)
            .filter(Prescription.id == prescription_id)
            .first()
        )

    def get_active_prescriptions(self):
        # [Refill Reminders] — return all prescriptions whose start_time has passed (batch daily check)
        return (
            self.db.query(Prescription)
            .filter(Prescription.start_time <= datetime.now(timezone.utc))
            .all()
        )

    def get_by_patient(self, patient_id: int):
        # [Refill Reminders] — return all prescriptions for a given patient
        return (
            self.db.query(Prescription)
            .filter(Prescription.patient_id == patient_id)
            .all()
        )
