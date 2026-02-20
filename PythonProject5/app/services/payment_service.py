import hashlib
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_payhere_hash(merchant_id: str, order_id: str, amount: str, currency: str) -> str:
    """
    Generates MD5 hash for PayHere checkout.
    Format: MD5(MerchantID + OrderID + Amount + Currency + MD5(PayHereSecret))
    """
    secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
    pre_hash_string = f"{merchant_id}{order_id}{amount}{currency}{secret_hash}"
    final_hash = hashlib.md5(pre_hash_string.encode()).hexdigest().upper()
    return final_hash

def verify_notify_signature(payload: dict) -> bool:
    """
    Verifies the integrity of PayHere notification.
    Format: MD5(MerchantID + OrderID + PayAmount + PayCurrency + StatusCode + MD5(PayHereSecret))
    """
    merchant_id = payload.get("merchant_id")
    order_id = payload.get("order_id")
    pay_amount = payload.get("pay_amount")
    pay_currency = payload.get("pay_currency")
    status_code = payload.get("status_code")
    received_sig = payload.get("md5sig")

    if not all([merchant_id, order_id, pay_amount, pay_currency, status_code, received_sig]):
        logger.warning(f"[PAYMENT_SERVICE] Missing parameters in PayHere notify payload")
        return False

    secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
    pre_hash_string = f"{merchant_id}{order_id}{pay_amount}{pay_currency}{status_code}{secret_hash}"
    calculated_sig = hashlib.md5(pre_hash_string.encode()).hexdigest().upper()

    is_valid = calculated_sig == received_sig
    if not is_valid:
        logger.error(f"[PAYMENT_SERVICE] Signature mismatch! Calculated: {calculated_sig}, Received: {received_sig}")
    return is_valid

def get_payment_params(appointment, user_phone: str, user_name: str):
    """Build parameters for PayHere checkout form."""
    merchant_id = settings.PAYHERE_MERCHANT_ID
    # PayHere requires amount to be formatted (e.g., 200.00)
    # Assuming fee is a string or number, formatting as float with 2 decimal places
    amount_formatted = "{:.2f}".format(float(appointment.fee))
    currency = "LKR"
    
    hash_val = generate_payhere_hash(merchant_id, appointment.payhere_order_id, amount_formatted, currency)
    
    params = {
        "merchant_id": merchant_id,
        "return_url": f"{settings.BASE_URL}/channelling/payment/return",
        "cancel_url": f"{settings.BASE_URL}/channelling/payment/cancel",
        "notify_url": f"{settings.BASE_URL}/channelling/payment/notify",
        "order_id": appointment.payhere_order_id,
        "items": f"Doctor Appointment: {appointment.doctor_name} ({appointment.specialty})",
        "currency": currency,
        "amount": amount_formatted,
        "first_name": user_name or "Patient",
        "last_name": "",
        "email": "customer@example.com", # Placeholder or from user profile if exists
        "phone": user_phone,
        "address": "HealixPharm Online",
        "city": "Colombo",
        "country": "Sri Lanka",
        "hash": hash_val
    }
    return params
