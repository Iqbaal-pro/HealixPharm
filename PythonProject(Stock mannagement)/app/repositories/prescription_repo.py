from app.models.prescription import Prescription
from app.models.patient import Patient


class PrescriptionRepository:
    """Repository for Prescription queries including refill-related filters."""

    def __init__(self, db):
        self.db = db

    def create(self, prescription):
        """Insert a new prescription."""
        self.db.add(prescription)
        self.db.commit()
        self.db.refresh(prescription)
        return prescription

    def get_by_id(self, prescription_id):
        """Fetch a single prescription by ID."""
        return self.db.query(Prescription).filter(
            Prescription.id == prescription_id
        ).first()

    def get_all(self):
        """Return all prescriptions."""
        return self.db.query(Prescription).all()

    def get_continuous_for_consented_patients(self):
        """
        Return prescriptions that are:
         - marked as continuous (is_continuous = True)
         - belong to patients who gave consent
        Used by the scheduler to find refill-eligible prescriptions.
        """
        return (
            self.db.query(Prescription)
            .join(Patient, Prescription.patient_id == Patient.id)
            .filter(
                Prescription.is_continuous == True,
                Patient.consent == True
            )
            .all()
        )

    def set_continuous(self, prescription_id: int, is_continuous: bool):
        """Toggle the is_continuous flag (pharmacist checkbox)."""
        prescription = self.get_by_id(prescription_id)
        if prescription:
            prescription.is_continuous = is_continuous
            self.db.commit()
            self.db.refresh(prescription)
        return prescription
