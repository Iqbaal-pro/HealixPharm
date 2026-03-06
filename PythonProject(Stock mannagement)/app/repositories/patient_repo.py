from sqlalchemy.orm import Session
from app.models.patient import Patient


class PatientRepository:
    """Repository for Patient CRUD and consent queries."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, patient: Patient) -> Patient:
        """Insert a new patient record."""
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def get_by_id(self, patient_id: int) -> Patient:
        """Fetch a single patient by ID."""
        return (
            self.db.query(Patient)
            .filter(Patient.id == patient_id)
            .first()
        )

    def get_all(self):
        """Return all patients."""
        return self.db.query(Patient).all()

    def get_all_consented(self):
        """Return only patients who have given consent for SMS."""
        return (
            self.db.query(Patient)
            .filter(Patient.consent == True)
            .all()
        )

    def update_consent(self, patient_id: int, consent: bool) -> Patient:
        """Toggle a patient's consent flag."""
        patient = self.get_by_id(patient_id)
        if patient:
            patient.consent = consent
            self.db.commit()
            self.db.refresh(patient)
        return patient
