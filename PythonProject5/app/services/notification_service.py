import logging
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        self.twilio_wa = TwilioWhatsAppClient()
        # import Twilio SMS client for rejection notifications
        try:
            from twilio.rest import Client as TwilioClient
            self._twilio_sms_client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        except Exception:
            self._twilio_sms_client = None

    def send_whatsapp_confirmation(self, to_phone: str, order_token: str):
        """
        Send WhatsApp confirmation message including order token via Twilio.
        """
        text = (
            f"Your order has been received and is pending pharmacist verification.\n"
            f"Order Token: {order_token}"
        )
        logger.info(f"[NOTIFY] Sending WhatsApp confirmation to {to_phone} for token {order_token}")
        return self.twilio_wa.send_text(to_phone, text)

    def send_rejection_sms(self, to_phone: str, order_token: str):
        """
        Send SMS via Twilio informing the user that their order was rejected.
        """
        if not self._twilio_sms_client:
            logger.error("[NOTIFY] Twilio SMS client not configured")
            raise RuntimeError("Twilio SMS client not configured")

        body = f"Your order with token {order_token} has been rejected."
        logger.info(f"[NOTIFY] Sending rejection SMS to {to_phone}")
        message = self._twilio_sms_client.messages.create(
            body=body,
            from_=settings.TWILIO_SMS_FROM_NUMBER,
            to=to_phone
        )
        logger.info(f"[NOTIFY] SMS sent SID: {message.sid}")
        return message.sid
