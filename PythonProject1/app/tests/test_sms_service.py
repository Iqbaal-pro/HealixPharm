# tests/test_sms_service.py
from unittest.mock import MagicMock
from app.services.sms_service import SMSService

def test_send_sms():
    db = MagicMock()
    sms_service = SMSService(db)
    sms_service.log_repo.log_attempt = MagicMock()
    result = sms_service.send_sms("+123456789", "Test message", reminder_id=1)
    assert result is True
    assert sms_service.log_repo.log_attempt.called
