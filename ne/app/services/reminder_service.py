from datetime import datetime, timezone, timedelta
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.issued_item_repo import IssuedItemRepository
from app.repositories.reminder_repo import ReminderRepository
from app.services.refill_calculator import RefillCalculator
from app.services.sms_service import SMSService
from app.utils.sms_formatter import format_refill_sms, format_dose_sms
from app.services.scheduler import scheduler


class ReminderService:
    def __init__(self, db):
        self.db = db
        self.prescription_repo = PrescriptionRepository(db)
        self.issued_repo = IssuedItemRepository(db)
        self.reminder_repo = ReminderRepository(db)
        self.sms_service = SMSService(db)

    # ─────────────────────────────────────────────────────────────────────────
    # [Refill Reminders] — Batch check (runs daily via scheduler)
    # ─────────────────────────────────────────────────────────────────────────

    def check_and_create_reminders(self, threshold_days: int = 3):
        # [Refill Reminders] — scan every active prescription and send an SMS
        # if the patient's remaining stock will run out within threshold_days.
        prescriptions = self.prescription_repo.get_active_prescriptions()
        reminders_created = 0

        for prescription in prescriptions:
            issued_qty = self.issued_repo.total_issued_quantity(prescription.id)

            total_quantity = getattr(prescription, "total_quantity", None)
            if total_quantity is None:
                # Fallback: if not set, we can't calculate refill
                continue

            # [Refill Reminders] — skip if a pending reminder already exists for this prescription
            if self.reminder_repo.has_pending_for_prescription(prescription.id):
                continue

            # [Refill Reminders] — calculate whether a refill is needed
            calculator = RefillCalculator(
                dose_per_day=getattr(prescription, "dose_per_day", getattr(prescription, "dose_quantity", None)),
                total_quantity=total_quantity,
                issued_quantity=issued_qty
            )

            if calculator.needs_refill(threshold_days):
                days_left = calculator.days_left()

                # [Refill Reminders] — create reminder row in DB (status: pending)
                reminder = self.reminder_repo.create(
                    prescription_id=prescription.id,
                    reminder_time=datetime.now(timezone.utc)
                )

                # [Refill Reminders] — build and send the SMS
                patient = prescription.patient
                sms_text = format_refill_sms(
                    patient_name=patient.name,
                    days_left=days_left
                )

                sent = False
                try:
                    sent = self.sms_service.send_sms(
                        to_number=patient.phone_number,
                        message=sms_text,
                        reminder_id=reminder.id
                    )
                except Exception:
                    sent = False

                # [Refill Reminders] — update reminder status based on send result
                try:
                    new_status = "sent" if sent else "failed"
                    self.reminder_repo.update_status(reminder.id, new_status)
                except Exception:
                    # Best-effort: don't raise so the batch continues
                    pass

                reminders_created += 1

        return reminders_created

    # ─────────────────────────────────────────────────────────────────────────
    # [Dose Reminders] — Recurring scheduling
    # ─────────────────────────────────────────────────────────────────────────

    def create_dose_reminders(self, prescription_id: int):
        """
        [Dose Reminders] — schedules the ENTIRE sequence of dose reminders 
        based on duration_days and reminder_type (time_based or meal_based).
        """
        prescription = self.prescription_repo.get_by_id(prescription_id)
        if not prescription:
            raise Exception("Prescription not found")

        duration = prescription.duration_days or 1
        reminders = []

        if prescription.reminder_type == "meal_based":
            reminders = self._schedule_meal_based(prescription, duration)
        else:
            # Default to time_based
            reminders = self._schedule_time_based(prescription, duration)

        return reminders

    def _schedule_time_based(self, prescription, duration_days: int):
        reminders = []
        interval = prescription.interval_hours or 24
        doses_per_day = 24 // interval
        total_doses = doses_per_day * duration_days
        
        start_time = prescription.start_time or datetime.now(timezone.utc)
        
        for i in range(1, total_doses + 1):
            reminder_time = start_time + timedelta(hours=i * interval)
            
            reminder = self.reminder_repo.create(
                prescription_id=prescription.id,
                reminder_time=reminder_time,
                medicine_name=prescription.medicine_name,
                dose_quantity=prescription.dose_quantity,
                meal_timing=prescription.meal_timing
            )
            
            # Schedule APScheduler job
            scheduler.add_job(
                self._send_dose_sms_task,
                trigger="date",
                run_date=reminder.reminder_time,
                args=[reminder.id]
            )
            reminders.append(reminder)
            
        return reminders

    def _schedule_meal_based(self, prescription, duration_days: int):
        reminders = []
        # Default meal times
        meal_times = {
            "breakfast": (8, 0),
            "lunch": (13, 0),
            "dinner": (20, 0)
        }
        
        start_date = (prescription.start_time or datetime.now(timezone.utc)).date()
        
        # Decide which meals based on dose_per_day or timing
        target_meals = []
        if prescription.meal_timing:
            timing = prescription.meal_timing.lower()
            if "breakfast" in timing: target_meals.append("breakfast")
            if "lunch" in timing: target_meals.append("lunch")
            if "dinner" in timing: target_meals.append("dinner")
        
        if not target_meals:
            # Fallback based on dose_per_day
            dpd = prescription.dose_per_day or 1
            if dpd >= 1: target_meals.append("breakfast")
            if dpd >= 2: target_meals.append("dinner")
            if dpd >= 3: target_meals.append("lunch")

        for d in range(1, duration_days + 1):
            day = start_date + timedelta(days=d)
            for m in target_meals:
                hour, minute = meal_times[m]
                reminder_time = datetime.combine(day, datetime.min.time().replace(hour=hour, minute=minute))
                # Ensure it's UTC-aware if we're using UTC system-wide
                reminder_time = reminder_time.replace(tzinfo=timezone.utc)
                
                reminder = self.reminder_repo.create(
                    prescription_id=prescription.id,
                    reminder_time=reminder_time,
                    medicine_name=prescription.medicine_name,
                    dose_quantity=prescription.dose_quantity,
                    meal_timing=f"{m} ({prescription.meal_timing or ''})"
                )
                
                scheduler.add_job(
                    self._send_dose_sms_task,
                    trigger="date",
                    run_date=reminder.reminder_time,
                    args=[reminder.id]
                )
                reminders.append(reminder)
                
        return reminders

    def _send_dose_sms_task(self, reminder_id: int):
        """Task called by APScheduler to send dose SMS."""
        # Use a fresh session for the background task
        from app.database.connection import SessionLocal
        db = SessionLocal()
        try:
            reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
            if not reminder:
                return

            prescription = reminder.prescription
            patient = prescription.patient
            
            sms_text = format_dose_sms(
                patient_name=patient.name,
                medicine_name=reminder.medicine_name,
                dose_quantity=reminder.dose_quantity,
                meal_timing=reminder.meal_timing
            )
            
            sms_service = SMSService(db)
            sent = sms_service.send_sms(
                to_number=patient.phone_number,
                message=sms_text,
                reminder_id=reminder.id
            )
            
            new_status = "sent" if sent else "failed"
            reminder.status = new_status
            db.commit()
            
            print(f"📩 Dose SMS {new_status.upper()} | reminder_id = {reminder_id}")
        except Exception as e:
            print(f"❌ Error sending dose SMS: {e}")
            db.rollback()
        finally:
            db.close()
