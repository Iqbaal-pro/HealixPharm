"""
SMS Service – sends text messages via SmsApi.lk.
Loads credentials from central settings.
"""
import os
import logging
import requests
import json
from app.core.config import settings

logger = logging.getLogger(__name__)


def normalize_sri_lankan_number(number: str) -> str:
    """
    Convert local Sri Lankan numbers to international format.
    Examples:
        0771234567  →  +94771234567
        +94771234567 → +94771234567  (already correct)
        94771234567  → +94771234567
    """
    number = number.strip()
    if number.startswith("0"):
        return "+94" + number[1:]
    if number.startswith("94") and not number.startswith("+"):
        return "+" + number
    if not number.startswith("+"):
        return "+94" + number
    return number


def send_sms(to_number: str, message: str) -> dict:
    """
    Send an SMS to the given phone number via SmsApi.lk.

    Set SMS_SIMULATE=true in .env to force simulation mode (no real API calls).

    Returns:
        dict with keys:
            success (bool) – whether the SMS was delivered
            sid (str|None)  – message UID on success
            error (str|None) – error description on failure
    """
    # ── Normalize phone number for Sri Lanka ─────────────────
    to_number = normalize_sri_lankan_number(to_number)

    # ── Check if simulation mode is forced ───────────────────
    simulate = os.getenv("SMS_SIMULATE", "false").lower() == "true"

    if simulate:
        logger.info(f"[SIMULATED SMS] To: {to_number} | Message: {message}")
        print(f"📩 [SIMULATED SMS] To: {to_number} | Message: {message}")
        return {"success": True, "sid": None, "error": None}

    # ── Actual SmsApi.lk send ──────────────────────────────
    url = "https://dashboard.smsapi.lk/api/v3/sms/send"
    headers = {
        "Authorization": f"Bearer {settings.SMS_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "recipient": to_number,
        "sender_id": settings.SMS_SENDER_ID,
        "message": message
    }

    try:
        logger.info(f"Sending SMS via smsapi.lk to {to_number}...")
        response = requests.post(
            url, 
            headers=headers, 
            json=payload,
            timeout=10
        )
        
        # success is usually status 200 or 201 for this API
        sent = response.status_code in [200, 201]
        
        if sent:
            try:
                data = response.json()
                sid = data.get("data", {}).get("uid")
            except Exception:
                sid = None
            
            logger.info(f"SMS sent to {to_number} | UID: {sid}")
            return {"success": True, "sid": sid, "error": None}
        else:
            error_msg = f"Status {response.status_code}: {response.text}"
            logger.error(f"SMS API returned error for {to_number}: {error_msg}")
            return {"success": False, "sid": None, "error": error_msg}

    except Exception as e:
        logger.error(f"EXCEPTION: Failed to send SMS to {to_number}: {e}")
        return {"success": False, "sid": None, "error": str(e)}
