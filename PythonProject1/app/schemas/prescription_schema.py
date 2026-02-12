# schemas/prescription_schema.py
from pydantic import BaseModel
from datetime import datetime

class PrescriptionSchema(BaseModel):
    id: int
    patient_id: int
    medicine_name: str
    dose_quantity: int
    interval_hours: int
    start_time: datetime

    class Config:
        orm_mode = True
