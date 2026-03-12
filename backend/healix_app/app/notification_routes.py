from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
notification_service = NotificationService()

class WhatsAppConfirmationRequest(BaseModel):
    to_phone: str
    order_token: str

class AgentConnectedRequest(BaseModel):
    to_phone: str

@router.post("/whatsapp-confirmation")
def whatsapp_confirmation(payload: WhatsAppConfirmationRequest):
    """Send order confirmation via WhatsApp."""
    try:
        result = notification_service.send_whatsapp_confirmation(payload.to_phone, payload.order_token)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rejection-sms")
def rejection_sms(payload: WhatsAppConfirmationRequest):
    """Send order rejection via SMS."""
    try:
        sid = notification_service.send_rejection_sms(payload.to_phone, payload.order_token)
        return {"status": "success", "sid": sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent-connected")
def agent_connected(payload: AgentConnectedRequest):
    """Notify user that an agent has joined the chat."""
    try:
        result = notification_service.send_agent_connected_notification(payload.to_phone)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
