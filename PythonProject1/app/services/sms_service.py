from app.repositories.reminder_log_repo import ReminderLogRepository

class SMSService:
    def __init__(self, db):
        self.log_repo = ReminderLogRepository(db)

    def send_sms(self, to_number: str, message: str, reminder_id: int):
        try:
            print(f"Sending SMS to {to_number}: {message}")

            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="sent",
                error_message=None
            )
            return True
        except Exception as e:
            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="failed",
                error_message=str(e)
            )
            return False
