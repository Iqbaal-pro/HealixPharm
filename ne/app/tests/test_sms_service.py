# tests/test_sms_service.py
from unittest.mock import MagicMock
from app.services.sms_service import SMSService


# [Refill Reminders] — unit tests for SMSService

def test_send_sms_success():
    # [Refill Reminders] — verify SMS send returns True and logs as "sent"
    db = MagicMock()
    sms_service = SMSService(db)
    sms_service.log_repo.log_attempt = MagicMock()

    result = sms_service.send_sms("+123456789", "Test message", reminder_id=1)

    assert result is True
    sms_service.log_repo.log_attempt.assert_called_once_with(
        reminder_id=1,
        result="sent",
        error_message=None
    )
