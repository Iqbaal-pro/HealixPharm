from sqlalchemy.orm import Session
from app.models.prescription import Prescription
from datetime import datetime, timezone

class PrescriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_prescriptions(self):
        """
        Return all prescriptions that have started.
        Used for batch refill reminder checks.
        """
        return (
            self.db.query(Prescription)
            .filter(Prescription.start_time <= datetime.now(timezone.utc))
            .all()
        )

    def get_by_patient(self, patient_id: int):
        """
        Return all prescriptions for a specific patient.
        """
        return (
            self.db.query(Prescription)
            .filter(Prescription.patient_id == patient_id)
            .all()
        )

    def get_by_id(self, prescription_id: int):
        """
        Return one prescription by ID.
        Used for single refill reminder creation.
        """
        return (
            self.db.query(Prescription)
            .filter(Prescription.id == prescription_id)
            .first()
        )
