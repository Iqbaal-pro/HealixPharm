import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.prescription import Prescription
from app.models.issued_item import IssuedItem
from app.services.fefo_deduction_service import FEFODeductionService
from app.services.reminder_service import generate_schedule_reminders

logger = logging.getLogger(__name__)

class SchedulingService:
    """
    Coordinates the medicine scheduling workflow:
    1. Create Prescription (Schedule)
    2. Deduct Stock (FEFO)
    3. Log Issued Items (Sales)
    4. Generate Reminder Schedule
    """

    def __init__(self, db: Session):
        self.db = db
        self.fefo_service = FEFODeductionService(db)

    def schedule_medicine(
        self,
        patient_id: int,
        medicine_id: int,
        staff_id: int,
        quantity_issued: int,
        dose_per_day: int,
        start_date: datetime,
        end_date: datetime,
        reminder_type: str,
        first_dose_time: datetime = None,
        meal_instruction: str = None,
        meal_types: str = None
    ) -> Prescription:
        """
        Main entry point for scheduling a medicine for a patient.
        """
        logger.info(f"[SCHEDULING] Scheduling medicine {medicine_id} for patient {patient_id}")

        # 1. Create Prescription record
        prescription = Prescription(
            patient_id=patient_id,
            medicine_id=medicine_id,
            staff_id=staff_id,
            uploaded_by_staff_id=staff_id,
            quantity_given=quantity_issued,
            dose_per_day=dose_per_day,
            start_date=start_date,
            end_date=end_date,
            reminder_type=reminder_type,
            first_dose_time=first_dose_time,
            meal_instruction=meal_instruction,
            meal_types=meal_types
        )
        self.db.add(prescription)
        self.db.flush() # Get ID before commit

        # 2. Deduct Stock using FEFO
        # issued_to is patient_id
        deductions = self.fefo_service.deduct_stock_fefo(
            medicine_id=medicine_id,
            quantity_needed=quantity_issued,
            issued_to=patient_id,
            reference_type="prescription_issue",
            staff_id=staff_id
        )

        # 3. Log Issued Items (Daily Sales Recording)
        for d in deductions:
            issued_item = IssuedItem(
                prescription_id=prescription.id,
                patient_id=patient_id,
                medicine_id=medicine_id,
                batch_id=d["batch_id"],
                quantity_issued=d["quantity_deducted"],
                issued_at=datetime.utcnow(),
                issued_by=staff_id
            )
            self.db.add(issued_item)

        # 4. Generate Reminder Schedule
        generate_schedule_reminders(self.db, prescription)

        self.db.commit()
        self.db.refresh(prescription)
        
        logger.info(f"[SCHEDULING] Successfully scheduled prescription {prescription.id}")
        return prescription
