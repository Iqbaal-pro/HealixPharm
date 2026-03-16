from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.database.db import get_db
from app.services.scheduling_service import SchedulingService

router = APIRouter(prefix="/schedule", tags=["scheduling"])

class ScheduleRequest(BaseModel):
    patient_id: int
    medicine_id: int
    staff_id: int
    quantity_issued: int
    dose_per_day: int
    start_date: datetime
    end_date: datetime
    reminder_type: str  # TIME_BASED | MEAL_BASED
    
    # Optional fields based on type
    first_dose_time: Optional[datetime] = None
    meal_instruction: Optional[str] = None # BEFORE_MEAL | AFTER_MEAL
    meal_types: Optional[str] = None      # e.g., "BREAKFAST,LUNCH"

@router.post("/")
def schedule_medicine(req: ScheduleRequest, db: Session = Depends(get_db)):
    """
    Endpoint to schedule medicine, deduct stock, log sale, and generate reminders.
    """
    service = SchedulingService(db)
    try:
        prescription = service.schedule_medicine(
            patient_id=req.patient_id,
            medicine_id=req.medicine_id,
            staff_id=req.staff_id,
            quantity_issued=req.quantity_issued,
            dose_per_day=req.dose_per_day,
            start_date=req.start_date,
            end_date=req.end_date,
            reminder_type=req.reminder_type,
            first_dose_time=req.first_dose_time,
            meal_instruction=req.meal_instruction,
            meal_types=req.meal_types
        )
        return {
            "success": True,
            "message": "Medicine scheduled successfully",
            "prescription_id": prescription.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling failed: {str(e)}")
