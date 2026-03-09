import hashlib
from app.core.config import settings

def generate_payhere_hash(merchant_id: str, order_id: str, amount: float, currency: str):
    """
    Generate the MD5 hash for PayHere checkout.
    Format: strtoupper(md5(merchant_id + order_id + amount_formatted + currency + strtoupper(md5(merchant_secret))))
    """
    secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
    
    # Amount must be formatted to 2 decimal places (e.g., 100.00)
    amount_formatted = "{:.2f}".format(amount)
    
    data_str = merchant_id + order_id + amount_formatted + currency + secret_hash
    final_hash = hashlib.md5(data_str.encode()).hexdigest().upper()
    
    return final_hash

def verify_payhere_signature(merchant_id: str, order_id: str, payhere_amount: str, payhere_currency: str, status_code: int, md5sig: str):
    """
    Verify the MD5 signature from PayHere notify callback.
    Format: strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
    """
    secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
    
    data_str = merchant_id + order_id + payhere_amount + payhere_currency + str(status_code) + secret_hash
    calculated_sig = hashlib.md5(data_str.encode()).hexdigest().upper()
    
    return calculated_sig == md5sig
