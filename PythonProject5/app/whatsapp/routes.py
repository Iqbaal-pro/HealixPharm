import logging
from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse, JSONResponse
from app.core.config import settings
from app.whatsapp.service import WhatsAppService_wb

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["WhatsApp"])
service_wb = WhatsAppService_wb()

logger.info("[WB_ROUTES] WhatsApp routes initialized")

@router.get("")
async def verify_webhook_wb(request: Request):
    """
    Webhook verification endpoint (GET)
    Meta sends verification challenge here
    """
    params = request.query_params
    
    logger.info(f"[WB_WEBHOOK] GET /webhook received | hub.mode: {params.get('hub.mode')} | hub.verify_token: {params.get('hub.verify_token')}")

    if (
        params.get("hub.mode") == "subscribe"
        and params.get("hub.verify_token") == settings.VERIFY_TOKEN
    ):
        logger.info("[WB_WEBHOOK] Webhook verification SUCCESSFUL")
        return PlainTextResponse(params.get("hub.challenge"))

    logger.warning(f"[WB_WEBHOOK] Webhook verification FAILED | Provided token: {params.get('hub.verify_token')} | Expected: {settings.VERIFY_TOKEN}")
    return PlainTextResponse("Verification failed", status_code=403)

@router.post("")
async def receive_webhook_wb(request: Request):
    """
    Webhook message receiving endpoint (POST)
    Receives messages and interactive replies from Meta
    """
    data = await request.json()
    logger.info(f"[WB_WEBHOOK] POST /webhook received | Full payload: {data}")

    try:
        value = data["entry"][0]["changes"][0]["value"]
        logger.debug(f"[WB_WEBHOOK] Extracted value from webhook")

        if "messages" not in value:
            logger.debug("[WB_WEBHOOK] No messages in webhook value, skipping")
            return JSONResponse({"status": "ignored"})

        msg = value["messages"][0]
        user_id = msg["from"]
        message_type = msg["type"]

        logger.info(f"[WB_WEBHOOK] MESSAGE_RECEIVED | User: {user_id} | Type: {message_type}")

        if message_type == "text":
            body = msg["text"]["body"].strip()
            logger.info(f"[WB_WEBHOOK] TEXT_MESSAGE | User: {user_id} | Body: {body}")
            
            message_data = {"body": body}
            service_wb.handle_user_message(user_id, "text", message_data)

        elif message_type == "interactive":
            button_id = msg["interactive"]["button_reply"]["id"]
            button_title = msg["interactive"]["button_reply"].get("title", "N/A")
            
            logger.info(f"[WB_WEBHOOK] INTERACTIVE_MESSAGE | User: {user_id} | Button: {button_id} | Title: {button_title}")
            
            message_data = {"button_id": button_id}
            service_wb.handle_user_message(user_id, "interactive", message_data)

        logger.info(f"[WB_WEBHOOK] Message processed successfully for user {user_id}")
        return JSONResponse({"status": "ok"})

    except Exception as e:
        logger.error(f"[WB_WEBHOOK] ERROR processing webhook: {str(e)}", exc_info=True)
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)
