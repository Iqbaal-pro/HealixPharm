from app.repositories.reminder_log_repo import ReminderLogRepository


class SMSService:
    """
    [Refill Reminders] — Sends an SMS and records the attempt in reminder_logs.
    Also usable by [Dose Reminders] if real SMS sending is added to that flow.
    """

    def __init__(self, db):
        # [Refill Reminders + Dose Reminders]
        self.log_repo = ReminderLogRepository(db)

    def send_sms(self, to_number: str, message: str, reminder_id: int):
        # [Refill Reminders] — send SMS (print stub) and log the outcome
        try:
            print(f"Sending SMS to {to_number}: {message}")

            # [Refill Reminders] — log successful send attempt
            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="sent",
                error_message=None
            )
            return True
        except Exception as e:
            # [Refill Reminders] — log failed send attempt
            self.log_repo.log_attempt(
                reminder_id=reminder_id,
                result="failed",
                error_message=str(e)
            )
            return False
