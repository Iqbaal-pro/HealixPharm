import logging
from twilio.rest import Client as TwilioClient
from app.core.config import settings

logger = logging.getLogger(__name__)


class TwilioWhatsAppClient:
    """
    Handles all Twilio WhatsApp API calls for sending messages
    """

    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_WHATSAPP_FROM
        self.client = TwilioClient(self.account_sid, self.auth_token)
        logger.info(f"[TWILIO_WA] TwilioWhatsAppClient initialized | From: {self.from_number}")

    def send_text(self, to: str, text: str) -> dict:
        """
        Send text message via Twilio WhatsApp
        """
        logger.info(f"[TWILIO_WA] Sending text to {to}: {text[:50]}..." if len(text) > 50 else f"[TWILIO_WA] Sending text to {to}: {text}")
        
        try:
            message = self.client.messages.create(
                from_=f"whatsapp:{self.from_number}",
                body=text,
                to=f"whatsapp:{to}"
            )
            logger.info(f"[TWILIO_WA] Text sent successfully to {to} | SID: {message.sid}")
            return {
                "status": "success",
                "message_sid": message.sid,
                "status_code": 200
            }
        except Exception as e:
            logger.error(f"[TWILIO_WA] Failed to send text to {to} | Error: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "status_code": 500
            }

    def send_menu(self, to: str, body_text: str, buttons: list) -> dict:
        """
        Send interactive button menu via Twilio WhatsApp
        buttons format: [{"id": "order", "title": "Order Medicine"}, ...]
        
        Note: Twilio WhatsApp API sends interactive messages with buttons differently than Meta.
        This sends formatted text with options listed.
        """
        logger.info(f"[TWILIO_WA] Sending menu to {to} with {len(buttons)} buttons")
        
        # Format buttons as numbered list
        formatted_text = body_text + "\n\n"
        for idx, btn in enumerate(buttons, 1):
            formatted_text += f"{idx}. {btn['title']}\n"
        
        logger.debug(f"[TWILIO_WA] Formatted menu text: {formatted_text}")
        
        return self.send_text(to, formatted_text)

    def send_list(self, to: str, body_text: str, sections: list) -> dict:
        """
        Send list message via Twilio WhatsApp
        sections format: [{"title": "...", "rows": [{"id": "...", "title": "..."}]}]
        
        Twilio WhatsApp sends this as formatted text.
        """
        logger.info(f"[TWILIO_WA] Sending list to {to}")
        
        formatted_text = body_text + "\n\n"
        for section in sections:
            formatted_text += f"**{section.get('title', 'Options')}**\n"
            for idx, row in enumerate(section.get('rows', []), 1):
                formatted_text += f"{idx}. {row.get('title', 'Option')}\n"
        
        logger.debug(f"[TWILIO_WA] Formatted list text: {formatted_text}")
        
        return self.send_text(to, formatted_text)

    def download_media(self, media_url: str) -> bytes:
        """
        Download media from Twilio URL (already authenticated)
        """
        logger.info(f"[TWILIO_WA] Downloading media from URL")
        import requests
        resp = requests.get(media_url, auth=(self.account_sid, self.auth_token))
        if resp.status_code != 200:
            logger.error(f"[TWILIO_WA] Failed to download media | Status: {resp.status_code}")
            raise RuntimeError("Failed to download media content")
        return resp.content
