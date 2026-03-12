import sys
import os
from unittest.mock import MagicMock, patch

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.broadcast_job import run_alert_broadcast_job
from app import models

def test_module_6_success_threshold():
    print("\n--- Testing Success Rate >= 90% (Should mark as SENT) ---")
    
    with patch("app.services.broadcast_job.SessionLocal") as MockSessionLocal, \
         patch("app.services.broadcast_job.alert_service") as mock_alert_service, \
         patch("app.services.broadcast_job.notif_service") as mock_notif_service:
        
        mock_db = MockSessionLocal.return_value
        
        # 10 patients
        patients = [f"+9477000000{i}" for i in range(10)]
        mock_alert_service.get_active_patient_numbers.return_value = patients
        
        # 1 eligible alert
        mock_alert = MagicMock(spec=models.MOHDiseaseAlert)
        mock_alert.id = 101
        mock_alert_service.get_eligible_alerts.return_value = [mock_alert]
        
        # 9 successes, 1 failure (90% success rate)
        responses = [{"success": True, "response": "ok"}] * 9 + [{"success": False, "response": "fail"}]
        mock_notif_service.send_whatsapp_message.side_effect = responses
        
        run_alert_broadcast_job()
        
        # Check if marked as sent
        mock_alert_service.mark_broadcast_sent.assert_called_once_with(mock_db, 101)
        mock_alert_service.update_retry.assert_not_called()
        print("Pass: 90% success correctly marks as broadcast_sent=True")

def test_module_6_failure_threshold():
    print("\n--- Testing Success Rate < 90% (Should NOT mark as SENT, should RETRY) ---")
    
    with patch("app.services.broadcast_job.SessionLocal") as MockSessionLocal, \
         patch("app.services.broadcast_job.alert_service") as mock_alert_service, \
         patch("app.services.broadcast_job.notif_service") as mock_notif_service:
        
        mock_db = MockSessionLocal.return_value
        
        # 10 patients
        patients = [f"+9477000000{i}" for i in range(10)]
        mock_alert_service.get_active_patient_numbers.return_value = patients
        
        # 1 eligible alert
        mock_alert = MagicMock(spec=models.MOHDiseaseAlert)
        mock_alert.id = 102
        mock_alert_service.get_eligible_alerts.return_value = [mock_alert]
        
        # 8 successes, 2 failures (80% success rate)
        responses = [{"success": True, "response": "ok"}] * 8 + [{"success": False, "response": "fail"}] * 2
        mock_notif_service.send_whatsapp_message.side_effect = responses
        
        run_alert_broadcast_job()
        
        # Check if NOT marked as sent, but retry updated
        mock_alert_service.mark_broadcast_sent.assert_not_called()
        mock_alert_service.update_retry.assert_called_once_with(mock_db, 102)
        print("Pass: < 90% success correctly triggers retry logic")

if __name__ == "__main__":
    print("--- STARTING MODULE 6 TEST (SUCCESS RATE LOGIC) ---")
    try:
        test_module_6_success_threshold()
        test_module_6_failure_threshold()
        print("\n--- MODULE 6 TESTS COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
