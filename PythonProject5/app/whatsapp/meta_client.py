import requests
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class MetaClient_wb:
    """
    Handles all Meta WhatsApp Cloud API calls
    """

    def __init__(self):
        self.token = settings.WHATSAPP_TOKEN
        self.phone_number_id = settings.PHONE_NUMBER_ID
        self.base_url = f"{settings.META_GRAPH_URL}/{self.phone_number_id}/messages"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        logger.info(f"[WB_META] MetaClient_wb initialized | Phone ID: {self.phone_number_id} | URL: {self.base_url}")

    def send_text(self, to: str, text: str) -> dict:
        """
        Send text message to user
        """
        logger.info(f"[WB_META] Sending text to {to}: {text[:50]}..." if len(text) > 50 else f"[WB_META] Sending text to {to}: {text}")
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }

        response = requests.post(self.base_url, headers=self.headers, json=payload)
        
        if response.status_code == 200:
            logger.info(f"[WB_META] Text sent successfully to {to}")
        else:
            logger.error(f"[WB_META] Failed to send text to {to} | Status: {response.status_code} | Response: {response.text}")
        
        return {
            "status_code": response.status_code,
            "response": response.text
        }

    def send_menu(self, to: str, body_text: str, buttons: list) -> dict:
        """
        Send interactive button menu to user
        buttons format: [{"id": "order", "title": "Order Medicine"}, ...]
        """
        logger.info(f"[WB_META] Sending menu to {to} with {len(buttons)} buttons")
        
        action_buttons = [
            {
                "type": "reply",
                "reply": {"id": btn["id"], "title": btn["title"]}
            }
            for btn in buttons
        ]

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body_text},
                "action": {"buttons": action_buttons}
            }
        }

        response = requests.post(self.base_url, headers=self.headers, json=payload)
        
        if response.status_code == 200:
            logger.info(f"[WB_META] Menu sent successfully to {to}")
        else:
            logger.error(f"[WB_META] Failed to send menu to {to} | Status: {response.status_code} | Response: {response.text}")
        
        return {
            "status_code": response.status_code,
            "response": response.text
        }

    def send_list(self, to: str, body_text: str, sections: list) -> dict:
        """
        Send list message to user
        sections format: [{"title": "...", "rows": [{"id": "...", "title": "..."}]}]
        """
        logger.info(f"[WB_META] Sending list to {to}")
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "body": {"text": body_text},
                "action": {"sections": sections}
            }
        }

        response = requests.post(self.base_url, headers=self.headers, json=payload)
        
        if response.status_code == 200:
            logger.info(f"[WB_META] List sent successfully to {to}")
        else:
            logger.error(f"[WB_META] Failed to send list to {to} | Status: {response.status_code} | Response: {response.text}")
        
        return {
            "status_code": response.status_code,
            "response": response.text
        }
