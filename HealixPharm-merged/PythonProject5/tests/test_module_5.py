import sys
import os
from unittest.mock import MagicMock, patch

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.broadcast_job import run_alert_broadcast_job
from app import models

def test_module_5():
    print("--- STARTING MODULE 5 TEST (APSCHEUDLER JOB ORCHESTRATION) ---")
    
    # 1. Mock DB and Services
    with patch("app.services.broadcast_job.SessionLocal") as MockSessionLocal, \
         patch("app.services.broadcast_job.alert_service") as mock_alert_service, \
         patch("app.services.broadcast_job.notif_service") as mock_notif_service:
        
        mock_db = MockSessionLocal.return_value
        
        # Setup mock patients
        mock_alert_service.get_active_patient_numbers.return_value = ["+94771111111", "+94772222222"]
        
        # Setup mock eligible alert
        mock_alert = MagicMock(spec=models.MOHDiseaseAlert)
        mock_alert.id = 100
        mock_alert.disease_name = "Mock Disease"
        mock_alert.region = "Mock Region"
        mock_alert.threat_level = "High"
        mock_alert_service.get_eligible_alerts.return_value = [mock_alert]
        
        # Mock notification service responses
        mock_notif_service.build_alert_message.return_value = "Mock Alert Message"
        mock_notif_service.send_whatsapp_message.return_value = {"success": True, "response": {"sid": "test_sid"}}
        
        # 2. Run the job
        print("\nStep 2: Running run_alert_broadcast_job...")
        run_alert_broadcast_job()
        
        # 3. Verify calls
        print("\nStep 3: Verifying service calls...")
        
        # Verify repository functions called
        mock_alert_service.expire_old_alerts.assert_called_once()
        mock_alert_service.get_eligible_alerts.assert_called_once()
        mock_alert_service.get_active_patient_numbers.assert_called_once()
        
        # Verify message building
        mock_notif_service.build_alert_message.assert_called_with(mock_alert)
        
        # Verify updates (once per alert)
        mock_alert_service.update_retry.assert_called_once_with(mock_db, mock_alert.id)
        mock_alert_service.mark_broadcast_sent.assert_called_once_with(mock_db, mock_alert.id)
        
        # Verify broadcast to both patients
        assert mock_notif_service.send_whatsapp_message.call_count == 2
        assert mock_alert_service.save_broadcast_log.call_count == 2
        
        # Check specific log call for first patient
        mock_alert_service.save_broadcast_log.assert_any_call(
            mock_db,
            alert_id=100,
            phone="+94771111111",
            status="SENT",
            response="{'sid': 'test_sid'}"
        )
        
        print("\n--- MODULE 5 TESTS COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    try:
        test_module_5()
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
