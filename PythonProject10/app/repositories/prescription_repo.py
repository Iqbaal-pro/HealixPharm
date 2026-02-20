from sqlalchemy.orm import Session
from app.models.prescription import Prescription


class PrescriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, prescription_id: int):
        return (
            self.db
            .query(Prescription)
            .filter(Prescription.id == prescription_id)
            .first()
        )
