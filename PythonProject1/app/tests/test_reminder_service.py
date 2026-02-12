# tests/test_reminder_service.py
import pytest
from unittest.mock import MagicMock
from app.services.reminder_service import ReminderService

def test_check_and_create_reminders():
    db = MagicMock()
    service = ReminderService(db)
    service.prescription_repo.get_active_prescriptions = MagicMock(return_value=[
        MagicMock(id=1, dose_per_day=1, interval_hours=24, medicine_name="Paracetamol", total_quantity=5)
    ])
    service.issued_repo.total_issued_quantity = MagicMock(return_value=3)
    service.reminder_repo.create = MagicMock()
    service.reminder_repo.update_status = MagicMock()
    service.reminder_repo.has_pending_for_prescription = MagicMock(return_value=False)

    service.check_and_create_reminders(threshold_days=3)
    assert service.reminder_repo.create.called
