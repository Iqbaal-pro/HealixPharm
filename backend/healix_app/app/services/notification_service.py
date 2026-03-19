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
            f"Your prescription has been successfully received! 📄✅\n\n"
            f"📦 *Order Token:* {order_token}\n\n"
            f"*What happens next?*\n"
            f"1️⃣ A pharmacist is currently reviewing your prescription.\n"
            f"2️⃣ Once approved, you will automatically receive a message here with your total bill and secure payment option.\n"
            f"3️⃣ Your medicine will be prepared for delivery!\n\n"
            f"_(Type 'menu' to return to the main menu at any time)_"
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

    def send_agent_connected_notification(self, to_phone: str):
        """
        Notify the user that an agent has joined the chat.
        """
        text = "You are now connected to a pharmacy agent."
        logger.info(f"[NOTIFY] Notifying {to_phone} that agent has connected")
        return self.twilio_wa.send_text(to_phone, text)
    def build_alert_message(self, alert):
        """
        Build message using ALERT_MESSAGE_TEMPLATE from settings.
        Supports placeholders: {disease_name}, {region}, {threat_level}
        """
        try:
            return settings.ALERT_MESSAGE_TEMPLATE.format(
                disease_name=alert.disease_name,
                region=alert.region,
                threat_level=alert.threat_level
            )
        except Exception as e:
            logger.error(f"[NOTIFY] Error formatting alert message: {e}")
            # Fallback to a simple default if formatting fails
            return f"ALERT: {alert.disease_name} in {alert.region}. Source: MOH"

    def send_whatsapp_message(self, phone, message):
        """
        FUNCTION SendWhatsAppMessage(phone, message):
            CALL Twilio WhatsApp API
            RETURN {success: true/false, response: json}
        """
        logger.info(f"[NOTIFY] Sending WhatsApp Alert to {phone}")
        result = self.twilio_wa.send_text(phone, message)
        return {
            "success": result.get("status") == "success",
            "response": result
        }
