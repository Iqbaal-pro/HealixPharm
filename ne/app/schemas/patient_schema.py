# schemas/patient_schema.py
from pydantic import BaseModel


class PatientSchema(BaseModel):
    # [Refill Reminders] — used to validate patient data returned in API responses
    id: int
    name: str
    phone_number: str
    date_of_birth: str | None = None
    language: str | None = None

    class Config:
        orm_mode = True
