"""
SMS Service – sends text messages via Twilio.
Loads credentials from .env (same as WhatsApp bot).
"""
import os
import logging
from dotenv import load_dotenv

# ─── Load environment variables ─────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

logger = logging.getLogger(__name__)

# ─── Twilio credentials ─────────────────────────────────────────────
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM_NUMBER")


def _get_twilio_client():
    """
    Lazily create a Twilio client.
    Returns None if credentials are missing (graceful fallback to console).
    """
    try:
        from twilio.rest import Client
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        else:
            logger.warning("Twilio credentials not set – SMS will be simulated")
            return None
    except ImportError:
        logger.warning("twilio package not installed – SMS will be simulated")
        return None


def send_sms(to_number: str, message: str) -> dict:
    """
    Send an SMS to the given phone number.

    Set SMS_SIMULATE=true in .env to force simulation mode (no real API calls).

    Returns:
        dict with keys:
            success (bool) – whether the SMS was delivered
            sid (str|None)  – Twilio message SID on success
            error (str|None) – error description on failure
    """
    # ── Check if simulation mode is forced ───────────────────
    simulate = os.getenv("SMS_SIMULATE", "false").lower() == "true"

    if simulate:
        logger.info(f"[SIMULATED SMS] To: {to_number} | Message: {message}")
        print(f"[SIMULATED SMS] To: {to_number} | Message: {message}")
        return {"success": True, "sid": None, "error": None}

    client = _get_twilio_client()

    # ── Fallback: print to console if Twilio is unavailable ──
    if client is None:
        logger.info(
            f"[SIMULATED SMS] To: {to_number} | Message: {message}"
        )
        print(f"📩 [SIMULATED SMS] To: {to_number} | Message: {message}")
        return {"success": True, "sid": None, "error": None}

    # ── Actual Twilio send ───────────────────────────────────
    try:
        msg = client.messages.create(
            body=message,
            from_=TWILIO_SMS_FROM,
            to=to_number
        )
        logger.info(f"SMS sent to {to_number} | SID: {msg.sid}")
        return {"success": True, "sid": msg.sid, "error": None}

    except Exception as e:
        logger.error(f"SMS FAILED to {to_number}: {e}")
        return {"success": False, "sid": None, "error": str(e)}
