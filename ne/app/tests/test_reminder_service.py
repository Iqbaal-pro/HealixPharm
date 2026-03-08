# tests/test_reminder_service.py
import pytest
from unittest.mock import MagicMock, patch
from app.services.reminder_service import ReminderService


# [Refill Reminders] — test that check_and_create_reminders creates a reminder when needed
def test_check_and_create_reminders():
    db = MagicMock()
    with patch("app.services.reminder_service.scheduler"):
        service = ReminderService(db)

    service.prescription_repo.get_active_prescriptions = MagicMock(return_value=[
        MagicMock(id=1, dose_per_day=1, interval_hours=24, medicine_name="Paracetamol", total_quantity=5)
    ])
    service.issued_repo.total_issued_quantity = MagicMock(return_value=3)
    service.reminder_repo.create = MagicMock(return_value=MagicMock(id=99))
    service.reminder_repo.update_status = MagicMock()
    service.reminder_repo.has_pending_for_prescription = MagicMock(return_value=False)
    service.sms_service.send_sms = MagicMock(return_value=True)

    count = service.check_and_create_reminders(threshold_days=3)
    assert service.reminder_repo.create.called
    assert count == 1


# [Dose Reminders] — test that create_dose_reminder_from_stock creates and schedules a reminder
def test_create_dose_reminder_from_stock():
    db = MagicMock()
    with patch("app.services.reminder_service.scheduler") as mock_scheduler:
        service = ReminderService(db)

        mock_prescription = MagicMock(
            id=1,
            medicine_name="Amoxicillin",
            dose_quantity=1,
            interval_hours=8,
            meal_timing="after meal",
            start_time=MagicMock()
        )
        service.prescription_repo.get_by_id = MagicMock(return_value=mock_prescription)
        service.issued_repo.get_by_prescription_id = MagicMock(return_value=[
            MagicMock(quantity_issued=24)
        ])
        mock_reminder = MagicMock(id=10)
        service.reminder_repo.create = MagicMock(return_value=mock_reminder)

        result = service.create_dose_reminder_from_stock(1)

        assert service.reminder_repo.create.called
        assert mock_scheduler.add_job.called
        assert result == mock_reminder
