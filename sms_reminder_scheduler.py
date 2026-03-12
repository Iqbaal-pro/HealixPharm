"""
SMS Reminder Scheduler for HealixPharm
Sends medication reminders via SMSAPI.lk at scheduled times.
"""

import requests
import json
import time
import logging
from datetime import datetime, date

# ── Configuration ──────────────────────────────────────────────────────────────
API_ENDPOINT = "https://dashboard.smsapi.lk/api/v3/sms/send"
API_TOKEN    = "393|E6YjD9e1f0JRDuGp401yDkPTYvwzOtj1u0C06LE6"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# ── Logging setup ──────────────────────────────────────────────────────────────
LOG_FILE = "sms_reminder_log.txt"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),          # also print to console
    ],
)
logger = logging.getLogger(__name__)


# ── Reminder Schedule ─────────────────────────────────────────────────────────
# Each reminder: scheduled_time (HH:MM 24h), patient_name, phone, message
REMINDERS = [
    {
        "scheduled_time": "14:05",        # 2:05 PM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 1 tablet of Medicine A at 2:05 PM before meals.",
    },
    {
        "scheduled_time": "14:10",        # 2:10 PM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 2 tablets of Medicine B at 2:10 PM after meals.",
    },
    {
        "scheduled_time": "14:15",        # 2:15 PM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 1 tablet of Medicine C at 2:15 PM.",
    },
    {
        "scheduled_time": "14:30",        # 2:30 PM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 2 tablets of Medicine E at after lunch.",
    },
    {
        "scheduled_time": "15:00",        # 3:00 PM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 2 tablets of Medicine Z at after lunch.",
    },
    {
        "scheduled_time": "05:00",        # 5:00 AM
        "patient_name":   "Iqbaal",
        "phone":          "+94771443155",
        "message":        "Hi Iqbaal, please take 1 tablet of Medicine A at 5:00 AM.",
    },
]


# ── Core SMS sender ─────────────────────────────────────────────────────────────
def send_sms(phone: str, message: str, max_retries: int = 3) -> dict:
    """
    Send an SMS via SMSAPI.lk.
    Retries immediately on failure up to max_retries times.
    Returns a dict with keys: success (bool), status_code, response_text.
    """
    payload = {
        "recipient": phone,
        "sender_id": "SMSAPI Demo",   # Only authorized originator on this account
        "message":   message,
    }

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempt {attempt}/{max_retries} — sending SMS to {phone}")
            response = requests.post(
                API_ENDPOINT,
                headers=HEADERS,
                data=json.dumps(payload),
                timeout=15,
            )
            logger.info(f"Response: HTTP {response.status_code} — {response.text}")

            if response.status_code in (200, 201):
                return {"success": True,  "status_code": response.status_code, "response_text": response.text}
            else:
                logger.warning(f"Non-success status {response.status_code} on attempt {attempt}.")

        except requests.exceptions.RequestException as exc:
            logger.error(f"Request error on attempt {attempt}: {exc}")

        if attempt < max_retries:
            logger.info("Retrying immediately…")

    return {"success": False, "status_code": None, "response_text": "All retries exhausted."}


# ── Logging helper ──────────────────────────────────────────────────────────────
def log_reminder_result(reminder: dict, scheduled_time: str, result: dict) -> None:
    actual_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status      = "Success" if result["success"] else "Failed"
    separator   = "=" * 70

    entry = (
        f"\n{separator}\n"
        f"Patient Name   : {reminder['patient_name']}\n"
        f"Phone Number   : {reminder['phone']}\n"
        f"Message        : {reminder['message']}\n"
        f"Scheduled Time : {scheduled_time}\n"
        f"Actual Time    : {actual_time}\n"
        f"Delivery Status: {status}\n"
        f"API Response   : {result.get('response_text', 'N/A')}\n"
        f"{separator}"
    )
    logger.info(entry)


# ── Scheduler ──────────────────────────────────────────────────────────────────
def run_scheduler() -> None:
    """
    Continuously checks the clock and fires each reminder exactly once
    at its scheduled time (HH:MM).
    """
    sent_today: set = set()          # tracks reminder indices already sent today
    today       = date.today()

    logger.info("SMS Reminder Scheduler started.")
    logger.info(f"Monitoring {len(REMINDERS)} reminder(s):")
    for i, r in enumerate(REMINDERS):
        logger.info(f"  [{i+1}] {r['scheduled_time']} → {r['message']}")

    while True:
        now       = datetime.now()
        now_hhmm  = now.strftime("%H:%M")

        # Reset sent set at midnight for a new day
        if now.date() != today:
            sent_today.clear()
            today = now.date()

        for idx, reminder in enumerate(REMINDERS):
            if idx in sent_today:
                continue                 # already sent today

            if now_hhmm == reminder["scheduled_time"]:
                logger.info(
                    f"\n>>> Reminder {idx+1} triggered at {now_hhmm} <<<\n"
                    f"    Message: {reminder['message']}"
                )
                result = send_sms(reminder["phone"], reminder["message"])
                log_reminder_result(reminder, reminder["scheduled_time"], result)
                sent_today.add(idx)

        time.sleep(20)   # check every 20 seconds


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    run_scheduler()
