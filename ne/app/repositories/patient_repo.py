from sqlalchemy.orm import Session
from app.models.patient import Patient


class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, patient_id: int):
        # [Refill Reminders] — fetch a patient by ID to get name and phone number for SMS
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_all(self):
        # [Refill Reminders] — fetch all patients
        return self.db.query(Patient).all()
