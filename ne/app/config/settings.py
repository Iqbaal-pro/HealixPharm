# config/settings.py
import os

# Refill reminder threshold in days
REFILL_THRESHOLD_DAYS = int(os.getenv("REFILL_THRESHOLD_DAYS", 3))

# SMS API settings
SMS_API_KEY = os.getenv("SMS_API_KEY", "393|E6YjD9e1f0JRDuGp401yDkPTYvwzOtj1u0C06LE6")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "SMSAPI Demo")

# settings.py
ENCRYPTION_KEY = b'xvLGCSII8i_3daoPlLoMePD_jtIScXT3M2Z1CO8qb-8='

