from sqlalchemy.orm import Session
from app.models.patient import Patient


class PatientRepository:
    """Repository for Patient CRUD and consent queries."""

    def __init__(self, db: Session):
        self.db = db

    def _generate_next_member_id(self) -> str:
        """Find the last member_id and increment the numeric part."""
        last_patient = (
            self.db.query(Patient)
            .filter(Patient.member_id.isnot(None))
            .order_by(Patient.id.desc())
            .first()
        )
        
        if not last_patient or not last_patient.member_id:
            return "00001"
            
        try:
            # Handle format "Name - 00001"
            if " - " in last_patient.member_id:
                parts = last_patient.member_id.split(" - ")
                last_numeric_part = parts[-1]
            else:
                last_numeric_part = last_patient.member_id
                
            last_id_int = int(last_numeric_part)
            next_id_int = last_id_int + 1
            return str(next_id_int).zfill(5)
        except (ValueError, IndexError):
            return "00001"

    def create(self, patient: Patient) -> Patient:
        """Insert a new patient record with an automatic Name - ID member_id."""
        if not patient.member_id:
            next_numeric = self._generate_next_member_id()
            patient.member_id = f"{patient.name} - {next_numeric}"
            
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
