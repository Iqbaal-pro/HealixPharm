# services/reminder_service.py
from datetime import datetime, timezone
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.issued_item_repo import IssuedItemRepository
from app.repositories.reminder_repo import ReminderRepository
from app.services.refill_calculator import RefillCalculator
from app.services.sms_service import SMSService
from app.utils.sms_formatter import format_refill_sms

class ReminderService:
    def __init__(self, db):
        self.prescription_repo = PrescriptionRepository(db)
        self.issued_repo = IssuedItemRepository(db)
        self.reminder_repo = ReminderRepository(db)
        self.sms_service = SMSService(db)

    # -------------------------------
    # Batch refill reminder (DAILY)
    # -------------------------------
    def check_and_create_reminders(self, threshold_days: int = 3):
        prescriptions = self.prescription_repo.get_active_prescriptions()
        reminders_created = 0

        for prescription in prescriptions:
            issued_qty = self.issued_repo.total_issued_quantity(prescription.id)

            total_quantity = getattr(prescription, "total_quantity", None)
            if total_quantity is None:
                raise ValueError(f"Prescription {prescription.id} has no total_quantity set")

            # Prevent duplicate pending reminders for the same prescription
            if self.reminder_repo.has_pending_for_prescription(prescription.id):
                continue

            # Calculate if refill is needed
            calculator = RefillCalculator(
                dose_per_day=getattr(prescription, "dose_per_day", getattr(prescription, "dose_quantity", None)),
                total_quantity=total_quantity,
                issued_quantity=issued_qty
            )

            if calculator.needs_refill(threshold_days):
                days_left = calculator.days_left()

                # Create reminder in DB (status pending)
                reminder = self.reminder_repo.create(
                    prescription_id=prescription.id,
                    reminder_time=datetime.now(timezone.utc)
                )

                # Prepare SMS message
                patient = prescription.patient
                sms_text = format_refill_sms(
                    patient_name=patient.name,
                    days_left=days_left
                )

                # Send SMS and update reminder status based on result
                sent = False
                try:
                    sent = self.sms_service.send_sms(
                        to_number=patient.phone_number,
                        message=sms_text,
                        reminder_id=reminder.id
                    )
                except Exception:
                    sent = False

                # Update reminder status
                try:
                    new_status = "sent" if sent else "failed"
                    self.reminder_repo.update_status(reminder.id, new_status)
                except Exception:
                    # Best-effort: don't raise so batch continues
                    pass

                reminders_created += 1

        return reminders_created
