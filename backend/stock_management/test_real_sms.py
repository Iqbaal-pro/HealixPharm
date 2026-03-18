import sys
import os

# Ensure the app can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.sms_service import send_sms
from app.core.config import settings

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_real_sms.py <phone_number>")
        print("Example: python test_real_sms.py 0771234567")
        sys.exit(1)

    test_number = sys.argv[1]
    message = "Test message from HealixPharm! If you got this, the SMS Gateway is perfectly connected."
    
    print(f"API Key Loaded: {bool(settings.SMS_API_KEY)}")
    print(f"Sender ID: {settings.SMS_SENDER_ID}")
    print(f"Simulation Mode: {os.getenv('SMS_SIMULATE', 'false')}")
    print(f"Attempting to send real SMS to {test_number}...")
    
    result = send_sms(test_number, message)
    
    print("\n--- Result ---")
    print(result)
    
    if result.get("success"):
        print("SUCCESS! The system is fully working and sending live messages.")
    else:
        print("FAILED. Please check your token or account balance on smsapi.lk.")

if __name__ == "__main__":
    main()
