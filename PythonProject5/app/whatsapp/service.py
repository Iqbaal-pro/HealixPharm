import logging
import uuid
from datetime import datetime
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.whatsapp.state import UserState_wb
from app.services.image_service import is_image_clear
from app.services.s3_service import upload_prescription, generate_presigned_url
from app.services.order_service import get_or_create_user, create_order_with_prescription
from app.services.notification_service import NotificationService
from app.services.payhere_service import PayHereService
from app.db import SessionLocal
from app import models
from datetime import timedelta

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
                # Welcome logic moved here for clarity
                self.twilio_wa.send_text(user_id, "Welcome to Healix Pharm")
                self.send_main_menu(user_id)
            else:
                self._handle_text_message(user_id, message_data)

        elif message_type == "image":
            self._handle_image_message(user_id, message_data)

        elif message_type == "interactive":
            logger.info(f"[WB_SERVICE] Processing interactive message from user {user_id}")
            button_id = message_data.get("button_id")
            if button_id:
                self._handle_button_click(user_id, str(button_id))
            else:
                logger.warning(f"[WB_SERVICE] Interactive message missing button_id for user {user_id}")

    def _handle_text_message(self, user_id: str, message_data: dict):
        """
        Handle incoming text messages
        """
        body = message_data.get("body", "").strip().lower()
        print(f"[DEBUG_SERVICE] Text Body: {body}")
        logger.info(f"[WB_SERVICE] TEXT_MESSAGE | User: {user_id} | Message: {body}")
        
        # 1. GREETINGS - Always handle these first so people who are "stuck" can get out
        if body in ["hi", "hello", "hey", "hii", "menu"]:
            logger.info(f"[WB_SERVICE] User {user_id} requested menu/greeting: {body}. Resetting to main menu.")
            self.send_main_menu(user_id)
            return

        # 2. STATE CHECK
        state = UserState_wb.get_user_state(user_id)
        current_step = state.get("current_step", "main_menu")
        
        # If user is in awaiting_prescription and sends text, it might be a caption.
        # Don't reset them if they are just typing while uploading.
        if current_step == "awaiting_prescription" or state.get("last_action") == "sending_image":
            logger.info(f"[WB_SERVICE] Ignoring potential caption text: '{body}' while in state: {current_step}")
            return

        # Define missing mappings
        faq_menu_mapping = {
            "1": "faq_hours",
            "2": "faq_delivery_areas",
            "3": "faq_prescription",
            "4": "faq_order_status",
            "5": "faq_delivery_charges",
            "6": "faq_refunds",
            "7": "back_to_main"
        }
        
        agent_menu_mapping = {
            "1": "agent_chat",
            "2": "agent_call",
            "3": "back_to_main"
        }
        
        delay_menu_mapping = {
            "1": "agent_faq",
            "2": "agent_continue"
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
                        
                        # Generate PayHere URL
                        pay_url = self.payhere.generate_checkout_url(
                            order.token, 
                            order.total_amount,
                            {"phone": user_id, "first_name": user.name or "Valued"}
                        )
                        
                        self.twilio_wa.send_text(user_id, f"Order {order.token} updated. 💳\n\nPlease use this secure link to complete your payment:\n{pay_url}\n\n⚠️ Payment must be made within 2 hours.")
                        UserState_wb.set_user_state(user_id, "main_menu")
                        return
                else:
                    logger.warning(f"[WB_SERVICE] User {user_id} in awaiting_payment_selection but no order found")
            finally:
                db.close()

        if current_step == "main_menu":
            logger.info(f"[WB_SERVICE] Unrecognized input from {user_id} in main_menu: '{body}'")
            # Handle numeric menu selections (1, 2, 3, 4) if not handled as greeting
            menu_mapping = {
                "1": "order",
                "2": "doctor",
                "3": "disease",
                "4": "agent"
            }
            if body in menu_mapping:
                self._handle_button_click(user_id, menu_mapping[body])
                return
            
            self.twilio_wa.send_text(user_id, "I didn't quite catch that. Please select an option from the menu below.")
            self.send_main_menu(user_id)
            return

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
            self.twilio_wa.send_text(user_id, "Doctor channeling coming soon.")

        elif button_id == "disease":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DISEASE button")
            self.twilio_wa.send_text(user_id, "Disease updates coming soon.")

        elif button_id == "agent":
            logger.info(f"[WB_SERVICE] User {user_id} clicked AGENT button")
            self.send_agent_menu(user_id)
        
        elif button_id == "agent_chat":
            logger.info(f"[WB_SERVICE] User {user_id} requested AGENT_CHAT")
            db = SessionLocal()
            try:
                user = get_or_create_user(db, phone=user_id)
                ticket = models.SupportTicket(user_id=user.id, status="WAITING")
                db.add(ticket)
                db.commit()
                UserState_wb.set_user_state(user_id, "waiting_for_agent")
                self.twilio_wa.send_text(user_id, "You have been added to the queue. An agent will be with you shortly.")
                # Schedule delay check after 20 seconds
                try:
                    from app.core.scheduler import scheduler
                    scheduler.add_job(
                        check_agent_delay,
                        'date',
                        run_date=datetime.now() + timedelta(seconds=20),
                        args=[user_id]
                    )
                except Exception as e:
                    logger.error(f"[WB_SERVICE] Failed to schedule delay check: {e}")
            finally:
                db.close()

        elif button_id == "agent_call":
            logger.info(f"[WB_SERVICE] User {user_id} requested AGENT_CALL")
            self.twilio_wa.send_text(user_id, "We have noted your request. An agent will call you shortly on this number. ☎️")
            UserState_wb.set_user_state(user_id, "main_menu")

        elif button_id == "agent_faq":
            self.send_faq_menu(user_id)
            
        elif button_id == "agent_continue":
            self.twilio_wa.send_text(user_id, "Thank you for your patience. We are still finding an agent for you.")
            
        elif button_id == "back_to_main":
            self.send_main_menu(user_id)
        else:
            logger.warning(f"[WB_SERVICE] Unknown button clicked | User: {user_id} | Button: {button_id}")

    def send_agent_menu(self, user_id: str):
        """
        Send the agent interaction sub-menu
        """
        logger.info(f"[WB_SERVICE] AGENT_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "agent_chat", "title": "Chat with Agent"},
            {"id": "agent_call", "title": "Request Call"},
            {"id": "back_to_main", "title": "Main Menu"}
        ]
        self.twilio_wa.send_menu(user_id, "How would you like to contact us?", buttons)
        UserState_wb.set_user_state(user_id, "agent_menu")

    def send_faq_menu(self, user_id: str):
        """
        Send the Help Bot / FAQ menu
        """
        menu_text = (
            "Healix Help Bot 🤖\n\n"
            "Choose a topic:\n"
            "1. Location & Hours\n"
            "2. Delivery Areas\n"
            "3. Prescription Policy\n"
            "4. Order Status\n"
            "5. Delivery Charges\n"
            "6. Refunds & Cancellations\n"
            "7. Back to Main Menu"
        )
        self.twilio_wa.send_text(user_id, menu_text)
        UserState_wb.set_user_state(user_id, "faq_mode")

    def _handle_faq_selection(self, user_id: str, selection: str):
        """
        Handle selection in the FAQ Bot
        """
        db = SessionLocal()
        try:
            if selection == "faq_hours":
                setting = db.query(models.PharmacySetting).filter(models.PharmacySetting.key == "hours").first()
                msg = setting.value if setting else "We are open 24/7."
            elif selection == "faq_delivery_areas":
                areas = db.query(models.DeliverySetting).all()
                msg = "Our Delivery Areas:\n" + "\n".join([f"- {a.area}" for a in areas]) if areas else "We deliver islandwide."
            elif selection == "faq_prescription":
                policy = db.query(models.PolicySetting).filter(models.PolicySetting.policy_type == "prescription").first()
                msg = policy.content if policy else "Prescription is required for most medicines."
            elif selection == "faq_order_status":
                user = db.query(models.User).filter(models.User.phone == user_id).first()
                order = db.query(models.Order).filter(models.Order.user_id == user.id).order_by(models.Order.created_at.desc()).first()
                msg = f"Order {order.token} Status: {order.status}" if order else "No active orders found."
            elif selection == "faq_delivery_charges":
                areas = db.query(models.DeliverySetting).all()
                msg = "Delivery Charges:\n" + "\n".join([f"- {a.area}: Rs. {a.charge}" for a in areas]) if areas else "Charges vary by distance."
            elif selection == "faq_refunds":
                policy = db.query(models.PolicySetting).filter(models.PolicySetting.policy_type == "refund").first()
                msg = policy.content if policy else "Refunds are processed within 3 days."
            else:
                self.send_main_menu(user_id)
                return
            
            self.twilio_wa.send_text(user_id, msg)
            self.send_faq_menu(user_id) # Show menu again
        finally:
            db.close()

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
        Process incoming prescription image
        """
        media_url = message_data.get("media_url")
        print(f"[DEBUG_SERVICE] Handling Image from {user_id}. Media URL: {media_url}")
        
        # Mark that we are processing an image to ignore accompanying text/captions
        UserState_wb.set_last_action(user_id, "sending_image")
        
        if not media_url:
            logger.error(f"[WB_SERVICE] No media URL provided by user {user_id}")
            self.twilio_wa.send_text(user_id, "Couldn't process the image. Please re-upload the prescription photo.")
            return

        try:
            # 1. Download image bytes from Twilio URL
            try:
                logger.info(f"[WB_SERVICE] Downloading media from {media_url}")
                image_bytes = self.twilio_wa.download_media(media_url)
                if not image_bytes:
                    raise ValueError("Empty image bytes received")
            except Exception as e:
                logger.error(f"[WB_SERVICE] Media download failed: {e}")
                self.twilio_wa.send_text(user_id, "Failed to download your prescription photo. Please try again.")
                return

            # 2. Validate image clarity
            try:
                clear = is_image_clear(image_bytes)
            except Exception as e:
                logger.error(f"[WB_SERVICE] Clarity check failed: {e}")
                clear = False

            if not clear:
                self.twilio_wa.send_text(user_id, "The image is unclear. Please re-upload a sharper photo of the prescription.")
                return

            # 3. Persist image to S3
            presc_id = uuid.uuid4().hex
            s3_key = upload_prescription(presc_id, image_bytes)
            s3_url = generate_presigned_url(s3_key)

            # 4. Create DB records (user, order, prescription)
            db = SessionLocal()
            try:
                presc_id = __import__("uuid").uuid4().hex
                s3_key = upload_prescription(presc_id, image_bytes)
                s3_url = generate_presigned_url(s3_key)
            except Exception as e:
                logger.error(f"[WB_SERVICE] S3 storage failed: {e}")
                self.twilio_wa.send_text(user_id, "Technical error: Could not save the prescription image to storage. Please check AWS configuration.")
                return

            # 4. Create DB records (user, order, prescription)
            try:
                db = SessionLocal()
                try:
                    user = get_or_create_user(db, phone=user_id)
                    order, prescription = create_order_with_prescription(db, user, s3_key, s3_url)
                    token = order.token
                finally:
                    db.close()
            except Exception as e:
                logger.error(f"[WB_SERVICE] Database operation failed: {e}")
                self.twilio_wa.send_text(user_id, "Technical error: Could not create your order in the database.")
                return

            # 5. Send confirmation via WhatsApp
            try:
                self.notifications.send_whatsapp_confirmation(user_id, token)
                UserState_wb.set_user_state(user_id, "main_menu")
                logger.info(f"[WB_SERVICE] Order created and confirmation sent | User: {user_id} | Token: {token}")
            except Exception as e:
                logger.error(f"[WB_SERVICE] Failed to send confirmation: {e}")
                self.twilio_wa.send_text(user_id, f"Your order has been placed successfully! Your Order Token is: {token}")
                UserState_wb.set_user_state(user_id, "main_menu")

        except Exception as e:
            logger.error(f"[WB_SERVICE] Unexpected error in image flow: {e}", exc_info=True)
            self.twilio_wa.send_text(user_id, "An unexpected error occurred. Please try again later.")

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

def close_all_user_tickets(db, user):
    """
    Close all WAITING or ACTIVE tickets for a user
    """
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.user_id == user.id,
        models.SupportTicket.status.in_(["WAITING", "ACTIVE"])
    ).all()
    for t in tickets:
        t.status = "COMPLETED"
    db.commit()

def check_agent_delay(user_id: str):
    """
    Background task to check if user is still waiting after the timeout
    """
    logger.info(f"[TIMER] Checking delay for user {user_id}")
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.phone == user_id).first()
        if not user:
            return

        # Check for WAITING ticket
        ticket = db.query(models.SupportTicket).filter(
            models.SupportTicket.user_id == user.id,
            models.SupportTicket.status == "WAITING"
        ).first()

        if ticket:
            # Check if user is still in the waiting state
            state = UserState_wb.get_user_state(user_id)
            if state.get("current_step") == "waiting_for_agent":
                logger.info(f"[TIMER] User {user_id} still waiting. Sending delay menu.")
                # Send delay menu
                buttons = [
                    {"id": "agent_faq", "title": "Try Help Bot"},
                    {"id": "agent_continue", "title": "Wait for Agent"}
                ]
                from app.whatsapp.twilio_client import TwilioWhatsAppClient
                tw = TwilioWhatsAppClient()
                tw.send_menu(user_id, "All our agents are currently busy. Would you like to try our help bot while you wait?", buttons)
            else:
                logger.info(f"[TIMER] User {user_id} state changed to {state.get('current_step')}. Skipping menu.")
        else:
            logger.info(f"[TIMER] No waiting ticket found for user {user_id}. Skipping.")
    finally:
        db.close()
 