# schemas/patient_schema.py
from pydantic import BaseModel

class PatientSchema(BaseModel):
    id: int
    name: str
    phone_number: str
    language: str | None = None

    class Config:
        orm_mode = True
