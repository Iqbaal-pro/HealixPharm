from app.models.prescription import Prescription

class PrescriptionRepository:

    def __init__(self, db):
        self.db = db

    def create(self, prescription):
        self.db.add(prescription)
        self.db.commit()
        self.db.refresh(prescription)
        return prescription

    def get_by_id(self, prescription_id):
        return self.db.query(Prescription).filter(
            Prescription.id == prescription_id
        ).first()
