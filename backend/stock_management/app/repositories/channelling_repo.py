from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.channelling_models import Doctor, ChannellingAppointment, ChannellingPatient

class ChannellingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_doctors(self) -> List[Doctor]:
        return self.db.query(Doctor).all()

    def get_doctor_by_id(self, doctor_id: int) -> Optional[Doctor]:
        return self.db.query(Doctor).filter(Doctor.id == doctor_id).first()

    def get_all_appointments(self) -> List[ChannellingAppointment]:
        return self.db.query(ChannellingAppointment).all()

    def get_appointment_by_id(self, appointment_id: int) -> Optional[ChannellingAppointment]:
        return self.db.query(ChannellingAppointment).filter(ChannellingAppointment.id == appointment_id).first()

    def get_appointments_by_doctor(self, doctor_id: int) -> List[ChannellingAppointment]:
        return self.db.query(ChannellingAppointment).filter(ChannellingAppointment.doctor_id == doctor_id).all()
