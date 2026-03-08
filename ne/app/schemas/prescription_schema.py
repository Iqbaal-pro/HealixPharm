# schemas/prescription_schema.py
from pydantic import BaseModel
from datetime import datetime


class PrescriptionSchema(BaseModel):
    # [Refill Reminders + Dose Reminders] — shared fields
    id: int
    patient_id: int
    medicine_name: str
    interval_hours: int

    # [Refill Reminders] — used in batch refill calculation
    dose_per_day: int | None = None
    start_time: datetime | None = None

    # [Dose Reminders] — used when scheduling a single dose reminder
    dose_quantity: int | None = None
    meal_timing: str | None = None
    uploaded_by_staff_id: int | None = None

    class Config:
        orm_mode = True
