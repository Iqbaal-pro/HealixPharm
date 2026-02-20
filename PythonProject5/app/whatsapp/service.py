import logging
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.whatsapp.state import UserState_wb
from app.services.image_service import is_image_clear
from app.services.s3_service import upload_prescription, generate_presigned_url
from app.services.order_service import get_or_create_user, create_order_with_prescription
from app.services.notification_service import NotificationService
from app.db import SessionLocal

logger = logging.getLogger(__name__)


class WhatsAppService_wb:
    """
    Business logic for WhatsApp interactions (now using Twilio API)
    Handles menus, flows, and user navigation
    """

    def __init__(self):
        self.twilio_wa = TwilioWhatsAppClient()
        logger.info("[WB_SERVICE] WhatsAppService_wb initialized with Twilio")
        self.notifications = NotificationService()
        
    def handle_user_message(self, user_id: str, message_type: str, message_data: dict):
        """
        Main message handler
        Routes message to appropriate handler based on type
        """
        logger.info(f"[WB_SERVICE] Handling message from user {user_id} | Type: {message_type} | Data: {message_data}")
        
        state = UserState_wb.get_user_state(user_id)
        current_step = state["current_step"]
        
        logger.debug(f"[WB_SERVICE] User {user_id} current step: {current_step}")

        if message_type == "text":
            logger.info(f"[WB_SERVICE] Processing text message from user {user_id}")
            self._handle_text_message(user_id, message_data)

        elif message_type == "image":
            logger.info(f"[WB_SERVICE] Processing image message from user {user_id}")
            self._handle_image_message(user_id, message_data)

        elif message_type == "interactive":
            logger.info(f"[WB_SERVICE] Processing interactive message from user {user_id}")
            button_id = message_data.get("button_id")
            self._handle_button_click(user_id, button_id)

    def _handle_text_message(self, user_id: str, message_data: dict):
        """
        Handle incoming text messages
        """
        logger.info(f"[WB_SERVICE] TEXT_MESSAGE_HANDLER | User: {user_id} | Message: {message_data.get('body', 'N/A')}")
        
        state = UserState_wb.get_user_state(user_id)
        
        # Always send welcome + main menu on first message (regardless of input)
        if state.get("is_first_message"):
            logger.info(f"[WB_SERVICE] First message from user {user_id} - sending welcome")
            self.twilio_wa.send_text(user_id, "Welcome to Healix Pharm")
            self.send_main_menu(user_id)
            # Mark that welcome has been sent
            UserState_wb.set_user_state(user_id, "main_menu", {"is_first_message": False})
            return
        
        body = message_data.get("body", "").strip().lower()
        
        # Handle numeric menu selections (1, 2, 3, 4)
        menu_mapping = {
            "1": "order",
            "2": "doctor",
            "3": "disease",
            "4": "agent"
        }
        
        if body in menu_mapping:
            logger.info(f"[WB_SERVICE] User {user_id} selected menu option {body}")
            button_id = menu_mapping[body]
            self._handle_button_click(user_id, button_id)
            return
        
        # If user explicitly requests ordering via text, start order flow
        if body in ["order medicine", "order now", "order"]:
            logger.info(f"[WB_SERVICE] User {user_id} initiated order via text")
            self.twilio_wa.send_text(user_id, "Please upload your prescription photo.")
            UserState_wb.set_user_state(user_id, "awaiting_prescription")
            return

        # Default: show main menu again
        logger.debug(f"[WB_SERVICE] Showing main menu again to user {user_id}")
        self.send_main_menu(user_id)

    def _handle_button_click(self, user_id: str, button_id: str):
        """
        Handle button clicks from interactive menus
        Route to appropriate flow based on button
        """
        logger.info(f"[WB_SERVICE] BUTTON_CLICK_HANDLER | User: {user_id} | Button: {button_id}")
        
        if button_id == "order":
            logger.info(f"[WB_SERVICE] User {user_id} clicked ORDER button")
            self.twilio_wa.send_text(user_id, "Please upload your prescription photo.")
            UserState_wb.set_user_state(user_id, "awaiting_prescription")
            logger.debug(f"[WB_SERVICE] User {user_id} state set to awaiting_prescription")

        elif button_id == "doctor":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DOCTOR button")
            booking_url = f"{__import__('app.core.config').core.config.settings.BASE_URL}/channelling"
            self.twilio_wa.send_text(
                user_id, 
                f"Please use our portal to book your appointment:\n\n{booking_url}\n\nSelect your specialty, doctor, and slot to proceed."
            )

        elif button_id == "disease":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DISEASE button")
            self.twilio_wa.send_text(user_id, "Disease updates coming soon.")

        elif button_id == "agent":
            logger.info(f"[WB_SERVICE] User {user_id} clicked AGENT button")
            self.twilio_wa.send_text(user_id, "An agent will contact you.")
        else:
            logger.warning(f"[WB_SERVICE] Unknown button clicked | User: {user_id} | Button: {button_id}")

    def send_main_menu(self, user_id: str):
        """
        Send main menu with all options
        PHASE 1 menu: Order, Doctor, Disease, Agent
        """
        logger.info(f"[WB_SERVICE] MAIN_MENU_SENT | User: {user_id}")
        
        buttons = [
            {"id": "order", "title": "Order Medicine"},
            {"id": "doctor", "title": "Channel Doctor"},
            {"id": "disease", "title": "Disease Updates"},
            {"id": "agent", "title": "Contact Agent"}
        ]

        logger.debug(f"[WB_SERVICE] Menu buttons: {[b['title'] for b in buttons]}")

        self.twilio_wa.send_menu(
            user_id,
            "Welcome Healix Pharm\nChoose an option:",
            buttons
        )

        UserState_wb.set_user_state(user_id, "main_menu")
        UserState_wb.set_last_action(user_id, "sent_main_menu")
        logger.info(f"[WB_SERVICE] Main menu sent and user state updated for {user_id}")

    def send_order_flow(self, user_id: str):
        """
        PHASE 2: Order flow
        Placeholder for future implementation
        """
        logger.info(f"[WB_SERVICE] PHASE 2 - ORDER_FLOW | User: {user_id} | Status: NOT IMPLEMENTED")
        pass

    def _handle_image_message(self, user_id: str, message_data: dict):
        """
        Process incoming prescription image:
        - download media
        - validate clarity
        - upload to S3
        - create order and prescription records
        - send confirmation message with order token
        """
        media_url = message_data.get("media_url")
        if not media_url:
            logger.error(f"[WB_SERVICE] No media URL provided by user {user_id}")
            self.twilio_wa.send_text(user_id, "Couldn't process the image. Please re-upload the prescription photo.")
            return

        try:
            # Download image bytes from Twilio URL
            image_bytes = self.twilio_wa.download_media(media_url)

            # Validate image clarity
            clear = is_image_clear(image_bytes)
            if not clear:
                self.twilio_wa.send_text(user_id, "The image is unclear. Please re-upload a sharper photo of the prescription.")
                return

            # Persist image to S3
            presc_id = __import__("uuid").uuid4().hex
            s3_key = upload_prescription(presc_id, image_bytes)
            s3_url = generate_presigned_url(s3_key)

            # Create DB records (user, order, prescription)
            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                order, prescription = create_order_with_prescription(db, user, s3_key, s3_url)
            finally:
                db.close()

            # Send confirmation via WhatsApp with order token
            self.notifications.send_whatsapp_confirmation(user_id, order.token)
            UserState_wb.set_user_state(user_id, "main_menu")
            logger.info(f"[WB_SERVICE] Order created and confirmation sent | User: {user_id} | Token: {order.token}")

        except Exception as e:
            logger.error(f"[WB_SERVICE] Error handling image message: {e}", exc_info=True)
            self.twilio_wa.send_text(user_id, "There was an error processing your prescription. Please try again later.")

    def send_reminder_flow(self, user_id: str):
        """
        PHASE 3: Reminder flow
        Placeholder for future implementation
        """
        logger.info(f"[WB_SERVICE] PHASE 3 - REMINDER_FLOW | User: {user_id} | Status: NOT IMPLEMENTED")
        pass

    def send_disease_alert(self, user_id: str, alert_data: dict):
        """
        PHASE 4: Disease alerts
        Placeholder for future implementation
        """
        logger.info(f"[WB_SERVICE] PHASE 4 - DISEASE_ALERT | User: {user_id} | Status: NOT IMPLEMENTED")
        pass
 