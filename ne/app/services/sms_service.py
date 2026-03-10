import requests
import json
from app.config.settings import SMS_API_KEY, SMS_SENDER_ID
from app.repositories.reminder_log_repo import ReminderLogRepository


class SMSService:
    """
    [Refill Reminders + Dose Reminders]
    Sends a real SMS via smsapi.lk and records the attempt in reminder_logs.
    """

    def __init__(self, db):
        self.log_repo = ReminderLogRepository(db)
        self.url = "https://dashboard.smsapi.lk/api/v3/sms/send"

    def send_sms(self, to_number: str, message: str, reminder_id: int):
        # Prepare headers and payload for smsapi.lk
        headers = {
            "Authorization": f"Bearer {SMS_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "recipient": to_number,
            "sender_id": SMS_SENDER_ID,
            "message": message
        }

        try:
            print(f"DEBUG: Sending SMS via smsapi.lk to {to_number}...")
            response = requests.post(
                self.url, 
                headers=headers, 
                data=json.dumps(payload),
                timeout=10
            )
            
            # success is usually status 200 or 201 for this API
            sent = response.status_code in [200, 201]
            error_msg = None if sent else f"Status {response.status_code}: {response.text}"
            
            if not sent:
                print(f"ERROR: SMS API returned {response.status_code}: {response.text}")

            # Log the outcome
            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="sent" if sent else "failed",
                error_message=error_msg
            )
            return sent

        except Exception as e:
            print(f"EXCEPTION: Failed to send SMS: {e}")
            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="failed",
                error_message=str(e)
            )
            return False
