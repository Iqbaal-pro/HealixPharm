import sys
import os
from unittest.mock import MagicMock, patch

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.notification_service import NotificationService
from app import models

def test_module_4():
    print("--- STARTING MODULE 4 TEST (WHATSAPP INTEGRATION) ---")
    
    # 1. Mock the TwilioWhatsAppClient to avoid real API calls
    with patch("app.services.notification_service.TwilioWhatsAppClient") as MockTwilioClient:
        mock_instance = MockTwilioClient.return_value
        # Configure mock for send_text
        mock_instance.send_text.return_value = {"status": "success", "message_sid": "SM123", "status_code": 200}
        
        notif_service = NotificationService()
        
        # 2. Test BuildAlertMessage
        print("\nStep 2: Testing build_alert_message...")
        mock_alert = MagicMock(spec=models.MOHDiseaseAlert)
        mock_alert.disease_name = "Cholera"
        mock_alert.region = "Galle"
        mock_alert.threat_level = "Medium"
        
        message = notif_service.build_alert_message(mock_alert)
        expected_message = "ALERT: Cholera in Galle. Threat: Medium. Take precautions. Source: MOH"
        
        print(f"Generated Message: {message}")
        assert message == expected_message
        print("Pass: build_alert_message")

        # 3. Test SendWhatsAppMessage
        print("\nStep 3: Testing send_whatsapp_message...")
        phone = "+94770000000"
        result = notif_service.send_whatsapp_message(phone, message)
        
        print(f"Send Result: {result}")
        assert result["success"] is True
        assert result["response"]["message_sid"] == "SM123"
        
        # Verify the mock was called with correct arguments
        mock_instance.send_text.assert_called_once_with(phone, message)
        print("Pass: send_whatsapp_message")

        print("\n--- MODULE 4 TESTS COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    try:
        test_module_4()
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
