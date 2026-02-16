import logging
from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
from app.whatsapp.service import WhatsAppService_wb

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
service_wb = WhatsAppService_wb()

logger.info("[WB_ROUTES] WhatsApp Twilio routes initialized")


@router.post("")
async def receive_webhook_wb(request: Request):
    """
    Webhook message receiving endpoint (POST)
    Receives messages from Twilio WhatsApp API
    Twilio sends form-encoded data, not JSON
    """
    logger.info("[WB_WEBHOOK] POST /webhook received from Twilio")

    try:
        # Parse Twilio's form-encoded payload
        form_data = await request.form()
        data = dict(form_data)
        
        logger.debug(f"[WB_WEBHOOK] Twilio webhook data keys: {list(data.keys())}")

        # Extract message sender and type
        from_number = data.get("From", "")
        if not from_number:
            logger.debug("[WB_WEBHOOK] No 'From' in webhook, ignoring")
            return PlainTextResponse("")

        # Remove 'whatsapp:' prefix if present
        user_id = from_number.replace("whatsapp:", "")
        logger.info(f"[WB_WEBHOOK] MESSAGE_RECEIVED | User: {user_id}")

        # Check message type: text vs media
        if "Body" in data:
            # Text message
            body = data.get("Body", "").strip()
            logger.info(f"[WB_WEBHOOK] TEXT_MESSAGE | User: {user_id} | Body: {body}")
            
            message_data = {"body": body}
            service_wb.handle_user_message(user_id, "text", message_data)

        elif "MediaUrl0" in data:
            # Media message (photo/image)
            media_url = data.get("MediaUrl0")
            media_content_type = data.get("MediaContentType0", "image/jpeg")
            logger.info(f"[WB_WEBHOOK] MEDIA_MESSAGE | User: {user_id} | Type: {media_content_type}")
            
            # Only handle images/photos for now
            if "image" in media_content_type:
                message_data = {"media_url": media_url}
                service_wb.handle_user_message(user_id, "image", message_data)
            else:
                logger.info(f"[WB_WEBHOOK] Unsupported media type: {media_content_type}")
                service_wb.twilio_wa.send_text(user_id, "Please send an image of your prescription.")
        else:
            logger.debug("[WB_WEBHOOK] No message body or media, ignoring")

        logger.info(f"[WB_WEBHOOK] Message processed successfully for user {user_id}")
        return PlainTextResponse("")

    except Exception as e:
        logger.error(f"[WB_WEBHOOK] ERROR processing webhook: {str(e)}", exc_info=True)
        return PlainTextResponse("", status_code=400)
