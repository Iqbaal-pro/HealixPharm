# schemas/reminder_schema.py
from pydantic import BaseModel
from datetime import datetime


class ReminderSchema(BaseModel):
    # [Refill Reminders + Dose Reminders] — shared fields
    id: int
    prescription_id: int
    reminder_time: datetime
    status: str

    # [Dose Reminders] — populated when a dose-specific reminder is created
    medicine_name: str | None = None
    dose_quantity: int | None = None
    meal_timing: str | None = None

    class Config:
        orm_mode = True
