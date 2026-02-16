import logging
from app.whatsapp.meta_client import MetaClient_wb
from app.whatsapp.state import UserState_wb

logger = logging.getLogger(__name__)

class WhatsAppService_wb:
    """
    Business logic for WhatsApp interactions
    Handles menus, flows, and user navigation
    """

    def __init__(self):
        self.meta = MetaClient_wb()
        logger.info("[WB_SERVICE] WhatsAppService_wb initialized")

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

        elif message_type == "interactive":
            logger.info(f"[WB_SERVICE] Processing interactive message from user {user_id}")
            button_id = message_data.get("button_id")
            self._handle_button_click(user_id, button_id)

    def _handle_text_message(self, user_id: str, message_data: dict):
        """
        Handle incoming text messages
        """
        logger.info(f"[WB_SERVICE] TEXT_MESSAGE_HANDLER | User: {user_id} | Message: {message_data.get('body', 'N/A')}")
        
        # Send welcome and main menu
        logger.debug(f"[WB_SERVICE] Sending welcome message to user {user_id}")
        self.meta.send_text(user_id, "Welcome Healix Pharm")
        
        logger.debug(f"[WB_SERVICE] Sending main menu to user {user_id}")
        self.send_main_menu(user_id)

    def _handle_button_click(self, user_id: str, button_id: str):
        """
        Handle button clicks from interactive menus
        Route to appropriate flow based on button
        """
        logger.info(f"[WB_SERVICE] BUTTON_CLICK_HANDLER | User: {user_id} | Button: {button_id}")
        
        if button_id == "order":
            logger.info(f"[WB_SERVICE] User {user_id} clicked ORDER button")
            self.meta.send_text(user_id, "Please upload your prescription photo.")
            UserState_wb.set_user_state(user_id, "awaiting_prescription")
            logger.debug(f"[WB_SERVICE] User {user_id} state set to awaiting_prescription")

        elif button_id == "doctor":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DOCTOR button")
            self.meta.send_text(user_id, "Doctor channeling coming soon.")

        elif button_id == "disease":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DISEASE button")
            self.meta.send_text(user_id, "Disease updates coming soon.")

        elif button_id == "agent":
            logger.info(f"[WB_SERVICE] User {user_id} clicked AGENT button")
            self.meta.send_text(user_id, "An agent will contact you.")
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

        self.meta.send_menu(
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
