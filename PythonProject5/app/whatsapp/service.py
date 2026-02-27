import logging
from datetime import datetime, timedelta
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.whatsapp.state import UserState_wb
from app.services.image_service import is_image_clear
from app.services.s3_service import upload_prescription, generate_presigned_url
from app.services.order_service import get_or_create_user, create_order_with_prescription, create_support_ticket, close_all_user_tickets, add_support_message
from app.services.notification_service import NotificationService
from app.services.payhere_service import PayHereService
from app.db import SessionLocal
from app import models
from app.core.scheduler import scheduler

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
        self.payhere = PayHereService()
        
    def handle_user_message(self, user_id: str, message_type: str, message_data: dict):
        """
        Main message handler
        Routes message to appropriate handler based on type
        """
        logger.info(f"[WB_SERVICE] Handling message from user {user_id} | Type: {message_type}")
        
        state = UserState_wb.get_user_state(user_id)
        is_first = state.get("is_first_message", False)
        
        if is_first:
            logger.info(f"[WB_SERVICE] First interaction from user {user_id}")
            # Clear flag immediately to prevent multi-webhook race conditions
            UserState_wb.set_user_state(user_id, state["current_step"], {"is_first_message": False})

        if message_type == "text":
            if is_first:
                self.twilio_wa.send_text(user_id, "Welcome to Healix Pharm")
                self.send_main_menu(user_id)
            else:
                self._handle_text_message(user_id, message_data)

        elif message_type == "image":
            self._handle_image_message(user_id, message_data)

        elif message_type == "interactive":
            button_id = message_data.get("button_id")
            self._handle_button_click(user_id, button_id)

    def _handle_text_message(self, user_id: str, message_data: dict):
        """
        Handle incoming text messages
        """
        body = message_data.get("body", "").strip().lower()
        print(f"[DEBUG_SERVICE] Text Body: {body}")
        logger.info(f"[WB_SERVICE] TEXT_MESSAGE | User: {user_id} | Message: {body}")
        
        # 1. GREETINGS & GLOBAL RESET
        if body in ["hi", "hello", "hey", "hii", "menu"]:
            logger.info(f"[WB_SERVICE] User {user_id} requested menu/greeting: {body}. Resetting.")
            
            # Close any active support tickets
            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                close_all_user_tickets(db, user)
            finally:
                db.close()

            self.send_main_menu(user_id)
            return

        # 2. STATE CHECK
        state = UserState_wb.get_user_state(user_id)
        current_step = state.get("current_step", "main_menu")
        
        # Mappings
        faq_menu_mapping = {
            "1": "faq_hours", "2": "faq_delivery_areas", "3": "faq_prescription",
            "4": "faq_order_status", "5": "faq_delivery_charges", "6": "faq_refunds",
            "7": "back_to_main"
        }
        
        agent_menu_mapping = {
            "1": "agent_chat", "2": "agent_call", "3": "back_to_main"
        }
        
        delay_menu_mapping = {
            "1": "agent_faq", "2": "agent_continue"
        }

        if current_step == "faq_mode" and body in faq_menu_mapping:
            self._handle_faq_selection(user_id, faq_menu_mapping[body])
            return

        if current_step == "agent_menu" and body in agent_menu_mapping:
            button_id = agent_menu_mapping[body]
            if button_id == "back_to_main":
                self.send_main_menu(user_id)
            else:
                self._handle_button_click(user_id, button_id)
            return

        if current_step == "waiting_for_agent":
            if body in delay_menu_mapping:
                self._handle_button_click(user_id, delay_menu_mapping[body])
                return
            self.twilio_wa.send_text(user_id, "Please wait for an agent or type 'menu' to return.")
            return

        if current_step == "live_chat":
            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                ticket = db.query(models.SupportTicket).filter(
                    models.SupportTicket.user_id == user.id,
                    models.SupportTicket.status == "ACTIVE"
                ).first()
                if ticket:
                    add_support_message(db, ticket.id, "USER", body)
            finally:
                db.close()
            return

        # NEW: Handle Payment Selection
        if current_step == "awaiting_payment_selection":
            db = SessionLocal()
            try:
                user = db.query(models.User).filter(models.User.phone == user_id).first()
                order = db.query(models.Order).filter(
                    models.Order.user_id == user.id,
                    models.Order.status == "AWAITING_PAYMENT_SELECTION"
                ).order_by(models.Order.created_at.desc()).first()

                if order:
                    if body == "1": # COD
                        order.payment_method = "COD"
                        order.status = "CONFIRMED"
                        order.payment_status = "PENDING_ON_DELIVERY"
                        db.commit()
                        self.twilio_wa.send_text(user_id, f"Order {order.token} confirmed! ✅\nYou chose Cash on Delivery. We will deliver your medicine shortly.")
                        UserState_wb.set_user_state(user_id, "main_menu")
                        return
                    elif body == "2": # Online
                        order.payment_method = "ONLINE"
                        order.payment_provider = "PAYHERE"
                        order.status = "AWAITING_PAYMENT"
                        db.commit()
                        
                        pay_url = self.payhere.generate_checkout_url(
                            order.token, 
                            order.total_amount,
                            {"phone": user_id, "first_name": user.name or "Valued"}
                        )
                        
                        self.twilio_wa.send_text(user_id, f"Order {order.token} updated. 💳\n\nPlease use this secure link to complete your payment:\n{pay_url}\n\n⚠️ Payment must be made within 2 hours.")
                        UserState_wb.set_user_state(user_id, "main_menu")
                        return
            finally:
                db.close()

        # Handle numeric menu selections in main_menu
        if current_step == "main_menu":
            menu_mapping = {"1": "order", "2": "doctor", "3": "disease", "4": "agent"}
            if body in menu_mapping:
                self._handle_button_click(user_id, menu_mapping[body])
                return
            
            # Explicit order keywords
            if body in ["order medicine", "order now", "order"]:
                self.twilio_wa.send_text(user_id, "Please upload your prescription photo.")
                UserState_wb.set_user_state(user_id, "awaiting_prescription")
                return

        # Handle caption while awaiting prescription
        if current_step == "awaiting_prescription" or state.get("last_action") == "sending_image":
            logger.info(f"[WB_SERVICE] Ignoring potential caption text: '{body}'")
            return

        # Default
        self.send_main_menu(user_id)

    def _handle_button_click(self, user_id: str, button_id: str):
        """
        Handle button clicks from interactive menus
        """
        logger.info(f"[WB_SERVICE] BUTTON_CLICK_HANDLER | User: {user_id} | Button: {button_id}")
        
        if button_id == "order":
            self.twilio_wa.send_text(user_id, "Please upload your prescription photo.")
            UserState_wb.set_user_state(user_id, "awaiting_prescription")

        elif button_id == "doctor":
            self.twilio_wa.send_text(user_id, "Doctor channeling coming soon.")

        elif button_id == "disease":
            self._handle_disease_updates(user_id)

        elif button_id == "agent":
            self.send_agent_menu(user_id)
        
        elif button_id == "agent_chat":
            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                create_support_ticket(db, user)
            finally:
                db.close()

            UserState_wb.set_user_state(user_id, "waiting_for_agent")
            self.twilio_wa.send_text(user_id, "You have been added to the queue.\nPlease wait for an available agent.\nType 'menu' to return to main menu.")
            
            # Schedule delay menu check after 20 seconds
            scheduler.add_job(
                check_agent_delay,
                'date',
                run_date=datetime.now() + timedelta(seconds=20),
                args=[user_id]
            )

        elif button_id == "agent_call":
            self.twilio_wa.send_text(user_id, "You can contact the pharmacy at:\n📞 +94 11 234 5678\n\nType 'menu' to return to main menu.")

        elif button_id == "agent_faq":
            self.send_faq_menu(user_id)
            
        elif button_id == "agent_continue":
            self.twilio_wa.send_text(user_id, "Thank you for your patience. An agent will be with you shortly.")
            
        elif button_id == "back_to_main":
            self.send_main_menu(user_id)

    def _handle_disease_updates(self, user_id: str):
        """
        Fetch and show active disease alerts.
        """
        db = SessionLocal()
        try:
            from app.services.alert_service import AlertService
            alert_service = AlertService(db)
            alerts = alert_service.get_active_alerts()

            if not alerts:
                msg = "No active health alerts for your region at this time. Stay safe! 🟢"
            else:
                msg = "🔔 *Active Health Alerts*:\n\n"
                for a in alerts:
                    msg += f"📍 {a.region}: {a.disease_name}\n⚠️ Level: {a.threat_level}\n\n"
                msg += "Please follow the guidelines provided by the Ministry of Health."

            self.twilio_wa.send_text(user_id, msg)
            self.send_main_menu(user_id)
        finally:
            db.close()

    def send_main_menu(self, user_id: str):
        """
        Send main menu
        """
        logger.info(f"[WB_SERVICE] MAIN_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "order", "title": "Order Medicine"},
            {"id": "doctor", "title": "Channel Doctor"},
            {"id": "disease", "title": "Disease Updates"},
            {"id": "agent", "title": "Contact Agent"}
        ]
        self.twilio_wa.send_menu(user_id, "Welcome Healix Pharm\nChoose an option:", buttons)
        UserState_wb.set_user_state(user_id, "main_menu")

    def send_agent_menu(self, user_id: str):
        """
        Send agent sub-menu
        """
        logger.info(f"[WB_SERVICE] AGENT_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "agent_chat", "title": "Chat with an Agent"},
            {"id": "agent_call", "title": "Call Pharmacy"},
            {"id": "back_to_main", "title": "Back to Main Menu"}
        ]
        self.twilio_wa.send_menu(user_id, "Please choose an option:", buttons)
        UserState_wb.set_user_state(user_id, "agent_menu")

    def send_delay_menu(self, user_id: str):
        """
        Send delay menu (20-second trigger)
        """
        logger.info(f"[WB_SERVICE] DELAY_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "agent_faq", "title": "Try help bot"},
            {"id": "agent_continue", "title": "Continue waiting"}
        ]
        self.twilio_wa.send_menu(user_id, "We are experiencing a delay. Please choose:", buttons)

    def send_faq_menu(self, user_id: str):
        """
        Send Automated FAQ Menu
        """
        logger.info(f"[WB_SERVICE] FAQ_MENU_SENT | User: {user_id}")
        message = (
            "🤖 *Automated Help Bot*\n"
            "How can we help you today?\n\n"
            "1. Pharmacy opening hours + location\n"
            "2. Delivery time and service areas\n"
            "3. Prescription requirements\n"
            "4. Order status (Last active order)\n"
            "5. Delivery charges\n"
            "6. Refund and cancellation policy\n"
            "7. Back to main menu\n\n"
            "Reply with the number of your choice."
        )
        self.twilio_wa.send_text(user_id, message)
        UserState_wb.set_user_state(user_id, "faq_mode")

    def _handle_faq_selection(self, user_id: str, selection: str):
        """
        Fetch real data from DB and answer FAQ questions
        """
        db = SessionLocal()
        try:
            if selection == "faq_hours":
                hours = db.query(models.PharmacySetting).filter_by(key="opening_hours").first()
                loc = db.query(models.PharmacySetting).filter_by(key="location").first()
                msg = f"📍 *Location & Hours*\n\n*Hours:* {hours.value if hours else 'Not set'}\n*Address:* {loc.value if loc else 'Not set'}"
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "faq_delivery_areas":
                areas = db.query(models.DeliverySetting).all()
                if areas:
                    msg = "🚚 *Delivery Service Areas*\n\n" + "\n".join([f"• {a.area}: {a.estimated_time}" for a in areas])
                else:
                    msg = "Delivery info currently unavailable."
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "faq_prescription":
                pol = db.query(models.PolicySetting).filter_by(policy_type="prescription").first()
                msg = f"💊 *Prescription Requirements*\n\n{pol.content if pol else 'Contact pharmacy for details.'}"
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "faq_order_status":
                user = db.query(models.User).filter_by(phone=user_id).first()
                if user:
                    order = db.query(models.Order).filter(
                        models.Order.user_id == user.id,
                        models.Order.status != "DELIVERED"
                    ).order_by(models.Order.created_at.desc()).first()
                    
                    if order:
                        msg = f"📦 *Order Status*\n\nOrder Token: `{order.token}`\nCurrent Status: *{order.status}*\nPlaced on: {order.created_at.strftime('%Y-%m-%d')}"
                    else:
                        msg = "No active orders found for your number."
                else:
                    msg = "No user profile found."
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "faq_delivery_charges":
                areas = db.query(models.DeliverySetting).all()
                if areas:
                    msg = "💰 *Delivery Charges*\n\n" + "\n".join([f"• {a.area}: Rs. {a.charge}" for a in areas])
                else:
                    msg = "Delivery pricing info currently unavailable."
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "faq_refunds":
                ref = db.query(models.PolicySetting).filter_by(policy_type="refund").first()
                can = db.query(models.PolicySetting).filter_by(policy_type="cancellation").first()
                msg = f"📝 *Refund & Cancellation*\n\n*Refund:* {ref.content if ref else 'N/A'}\n\n*Cancellation:* {can.content if can else 'N/A'}"
                self.twilio_wa.send_text(user_id, msg)

            elif selection == "back_to_main":
                self.send_main_menu(user_id)
                return

            self.send_faq_menu(user_id)

        finally:
            db.close()

    def _handle_image_message(self, user_id: str, message_data: dict):
        """
        Process incoming prescription image
        """
        media_url = message_data.get("media_url")
        UserState_wb.set_last_action(user_id, "sending_image")
        
        if not media_url:
            self.twilio_wa.send_text(user_id, "Couldn't process the image. Please re-upload.")
            return

        try:
            image_bytes = self.twilio_wa.download_media(media_url)
            if not image_bytes:
                raise ValueError("Empty image bytes")

            if not is_image_clear(image_bytes):
                self.twilio_wa.send_text(user_id, "The image is unclear. Please re-upload a sharper photo.")
                return

            presc_id = __import__("uuid").uuid4().hex
            s3_key = upload_prescription(presc_id, image_bytes)
            s3_url = generate_presigned_url(s3_key)

            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                order, prescription = create_order_with_prescription(db, user, s3_key, s3_url)
                token = order.token
            finally:
                db.close()

            self.notifications.send_whatsapp_confirmation(user_id, token)
            UserState_wb.set_user_state(user_id, "main_menu")

        except Exception as e:
            logger.error(f"[WB_SERVICE] Error in image flow: {e}", exc_info=True)
            self.twilio_wa.send_text(user_id, "There was an error processing your prescription.")

    def send_order_flow(self, user_id: str): pass
    def send_reminder_flow(self, user_id: str): pass
    def send_disease_alert(self, user_id: str, alert_data: dict): pass

def check_agent_delay(user_id: str):
    """
    Background task to check if user is still waiting after the timeout
    """
    logger.info(f"[TIMER] Checking delay for user {user_id}")
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.phone == user_id).first()
        if not user:
            logger.warning(f"[TIMER] User {user_id} not found in DB")
            return

        ticket = db.query(models.SupportTicket).filter(
            models.SupportTicket.user_id == user.id,
            models.SupportTicket.status == "WAITING"
        ).first()

        if ticket:
            state = UserState_wb.get_user_state(user_id)
            current_step = state.get("current_step")
            
            if current_step == "waiting_for_agent":
                logger.info(f"[TIMER] Triggering delay menu for {user_id}")
                service = WhatsAppService_wb()
                service.send_delay_menu(user_id)
        else:
            logger.info(f"[TIMER] No waiting ticket found for user {user_id}.")
    except Exception as e:
        logger.error(f"[TIMER] Error in check_agent_delay: {e}", exc_info=True)
    finally:
        db.close()
