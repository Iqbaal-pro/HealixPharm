# config/settings.py
import os

# Refill reminder threshold in days
REFILL_THRESHOLD_DAYS = int(os.getenv("REFILL_THRESHOLD_DAYS", 3))

# SMS API settings
SMS_API_KEY = os.getenv("SMS_API_KEY")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "HealixPharm")
