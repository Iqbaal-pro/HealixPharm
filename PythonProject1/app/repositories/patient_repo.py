from sqlalchemy.orm import Session
from app.models.patient import Patient

class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, patient_id: int):
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_all(self):
        return self.db.query(Patient).all()
