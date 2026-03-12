import hashlib
import logging
from urllib.parse import urlencode
from app.core.config import settings

logger = logging.getLogger(__name__)

class PayHereService:
    """
    Service to handle PayHere Hosted Checkout integration.
    Documentation: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
    """

    def __init__(self):
        self.merchant_id = settings.PAYHERE_MERCHANT_ID
        self.merchant_secret = settings.PAYHERE_MERCHANT_SECRET
        self.notify_url = settings.PAYHERE_NOTIFY_URL
        self.is_sandbox = settings.PAYHERE_SANDBOX
        self.currency = settings.PAYHERE_CURRENCY

        self.base_url = (
            "https://sandbox.payhere.lk/pay/checkout"
            if self.is_sandbox
            else "https://www.payhere.lk/pay/checkout"
        )

    def _generate_hash(self, order_id: str, amount: float) -> str:
        """
        Generate MD5 hash for payment request.
        Format: UpperCase(Md5( MerchantID + OrderID + FormattedAmount + Currency + Uppercase(Md5(MerchantSecret)) ))
        """
        amount_formatted = "{:.2f}".format(amount)
        secret_hash = hashlib.md5(self.merchant_secret.encode()).hexdigest().upper()
        
        main_string = (
            self.merchant_id + 
            str(order_id) + 
            amount_formatted + 
            self.currency + 
            secret_hash
        )
        
        final_hash = hashlib.md5(main_string.encode()).hexdigest().upper()
        return final_hash

    def generate_checkout_url(self, order_token: str, amount: float, user_details: dict) -> str:
        """
        Constructs the PayHere checkout URL with required parameters.
        """
        params = {
            "merchant_id": self.merchant_id,
            "return_url": "", # Optional for Bot flow, can be a thank you page
            "cancel_url": "", # Optional
            "notify_url": self.notify_url,
            "order_id": order_token,
            "items": f"Medicine Order {order_token}",
            "currency": self.currency,
            "amount": "{:.2f}".format(amount),
            "first_name": user_details.get("first_name", "Valued"),
            "last_name": user_details.get("last_name", "Customer"),
            "email": user_details.get("email", "customer@healix.lk"),
            "phone": user_details.get("phone", ""),
            "address": user_details.get("address", "N/A"),
            "city": user_details.get("city", "Colombo"),
            "country": "Sri Lanka",
            "hash": self._generate_hash(order_token, amount)
        }
        
        query_string = urlencode(params)
        return f"{self.base_url}?{query_string}"

    def verify_ipn_signature(self, payload: dict) -> bool:
        """
        Verify the authenticity of PayHere IPN notification.
        Format: UpperCase(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UpperCase(md5(merchant_secret))))
        """
        merchant_id = payload.get("merchant_id")
        order_id = payload.get("order_id")
        payhere_amount = payload.get("payhere_amount")
        payhere_currency = payload.get("payhere_currency")
        status_code = payload.get("status_code")
        md5sig = payload.get("md5sig")

        if not all([merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig]):
            logger.warning("[PAYHERE_SERVICE] IPN payload missing required fields for verification")
            return False

        secret_hash = hashlib.md5(self.merchant_secret.encode()).hexdigest().upper()
        
        # PayHere sends back formatted amount in IPN
        check_string = (
            merchant_id + 
            order_id + 
            payhere_amount + 
            payhere_currency + 
            status_code + 
            secret_hash
        )
        
        generated_sig = hashlib.md5(check_string.encode()).hexdigest().upper()
        
        is_valid = (generated_sig == md5sig)
        if not is_valid:
            logger.error(f"[PAYHERE_SERVICE] IPN Signature Mismatch! Generated: {generated_sig} | Received: {md5sig}")
        
        return is_valid
