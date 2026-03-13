from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base


class Prescription(Base):
    """
    Extended prescription model for the reminder system.
    - dose_per_day: how many doses per day (used for refill calculation)
    - quantity_given: total units dispensed to patient
    - start_date: when the prescription started
    - is_continuous: pharmacist marks this for long-term / recurring meds
    """
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    staff_id = Column(Integer, nullable=False)
    uploaded_by_staff_id = Column(Integer, nullable=True) # For compatibility/tracking

    # Scheduling details
    dose_per_day = Column(Integer, nullable=False, default=1)
<<<<<<< HEAD
=======
    
    # --- New Dose Reminder Fields (Migrated from healix_extra) ---
    dose_quantity = Column(Integer, nullable=True, default=0)
    interval_hours = Column(Integer, nullable=True, default=0)
    meal_timing = Column(String(100), nullable=True)
    start_time = Column(DateTime, nullable=True)
    # -----------------------------------------------------------

    start_date = Column(DateTime, default=datetime.utcnow)
>>>>>>> 4dbb78e3c9a06363b9242c2c3f5d630ffabe2351
    quantity_given = Column(Integer, nullable=False, default=0)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    
    # Reminder Configuration
    reminder_type = Column(String(20), nullable=False)  # TIME_BASED | MEAL_BASED
    
    # For Time-Based
    first_dose_time = Column(DateTime, nullable=True)
    
    # For Meal-Based
    meal_instruction = Column(String(20), nullable=True) # BEFORE_MEAL | AFTER_MEAL
    meal_types = Column(String(100), nullable=True)      # Comma-separated: BREAKFAST,LUNCH,DINNER

    # Pharmacist checkbox: long-term / continuous medication
    is_continuous = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
