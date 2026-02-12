# schemas/reminder_schema.py
from pydantic import BaseModel
from datetime import datetime

class ReminderSchema(BaseModel):
    id: int
    prescription_id: int
    medicine_name: str
    dose_quantity: int
    reminder_time: datetime
    status: str

    class Config:
        orm_mode = True
