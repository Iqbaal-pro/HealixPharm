import logging
from datetime import datetime, timedelta
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.whatsapp.state import UserState_wb
from app.services.image_service import is_image_clear
from app.services.s3_service import upload_prescription, generate_presigned_url
from app.services.order_service import get_or_create_patient, create_order_with_prescription, create_support_ticket, close_all_user_tickets, add_support_message
from app.services.notification_service import NotificationService
from app.services.payhere_service import PayHereService
from app.services.whatsapp_auth_service import WhatsAppAuthService
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

        # 1. Patient Verification Check
        db = SessionLocal()
        try:
            if not WhatsAppAuthService.is_authenticated(db, user_id):
                logger.warning(f"[WB_SERVICE] Access denied for unregistered user: {user_id}")
                auth_msg = ("This service is currently available for registered HealixPharm patients.""Please register using this link to access our WhatsApp services:\nhttps://docs.google.com/forms/d/e/1FAIpQLScL-64bBAzsst8KC6qFvyAKomsEW07W5NF3Tx8FWEN0CefRFQ/viewform?usp=sharing&ouid=101673084709681318504")
                self.twilio_wa.send_text(user_id, auth_msg)
                return
        finally:
            db.close()

        state = UserState_wb.get_user_state(user_id)
        is_first = state.get("is_first_message", False)

        if is_first:
            logger.info(f"[WB_SERVICE] First interaction from user {user_id}")
            UserState_wb.set_user_state(user_id, state["current_step"], {"is_first_message": False})

            welcome_text = (
                "Welcome to HealiXPharm 🏥\n\n"
                "📖 *How to use HealiXPharm Bot:*\n\n"
                "1️⃣ *Select* an option below.\n"
                "2️⃣ *Follow* the prompts.\n"
                "3️⃣ *Type* 'menu' anytime to return home.\n\n"
                "Please reply with 1, 2, 3, or 4."
            )
            buttons = [
                {"id": "order", "title": "Order Medicine"},
                {"id": "doctor", "title": "Channel Doctor"},
                {"id": "disease", "title": "Disease Updates"},
                {"id": "agent", "title": "Contact Agent"}
            ]
            self.twilio_wa.send_menu(user_id, welcome_text, buttons)
            UserState_wb.set_user_state(user_id, "main_menu")
            return

        if message_type == "text":
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

        # 1. GREETINGS & GLOBAL RESET
        if body in ["hi", "hello", "hey", "hii", "menu"]:
            logger.info(f"[WB_SERVICE] User {user_id} requested menu/greeting: {body}. Resetting.")

            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                close_all_user_tickets(db, patient)
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
            "1": "agent_faq", "2": "agent_continue", "3": "agent_back"
        }

        if current_step == "faq_mode":
            if body in faq_menu_mapping:
                self._handle_faq_selection(user_id, faq_menu_mapping[body])
                return
            
            # Invalid input at FAQ menu
            self.twilio_wa.send_text(
                user_id,
                "Please reply with a number from 1 to 7, or type menu to return to the Main Menu."
            )
            return

        if current_step in ["waiting_for_agent", "agent_delay_menu"]:
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                active_ticket = db.query(models.SupportTicket).filter(
                    models.SupportTicket.patient_id == patient.id,
                    models.SupportTicket.status == "ACTIVE"
                ).first()
                if active_ticket:
                    logger.info(f"[WB_SERVICE] Found ACTIVE ticket for {user_id}. Moving to live_chat.")
                    current_step = "live_chat"
                    UserState_wb.set_user_state(user_id, "live_chat")
            finally:
                db.close()

        if current_step == "agent_menu":
            if body in agent_menu_mapping:
                button_id = agent_menu_mapping[body]
                self._handle_button_click(user_id, button_id)
                return
            # Invalid input at agent menu
            self.twilio_wa.send_text(
                user_id,
                "Please reply with 1, 2, or 3.\n"
                "1 - Chat with an Agent\n"
                "2 - Call Pharmacy\n"
                "3 - Back to Main Menu\n\n"
                "Or type 'menu' anytime."
            )
            return

        if current_step == "waiting_for_agent":
            self.twilio_wa.send_text(user_id, "Please wait for an agent or type 'menu' to go back to main menu.")
            return

        if current_step == "agent_delay_menu":
            if body in delay_menu_mapping:
                self._handle_button_click(user_id, delay_menu_mapping[body])
                return
            # Invalid input at delay menu
            self.twilio_wa.send_text(
                user_id,
                "Please reply with 1, 2, or 3.\n"
                "1 - Try help bot\n"
                "2 - Continue waiting\n"
                "3 - Go back\n\n"
                "Or type 'menu' anytime."
            )
            return

        if current_step == "live_chat":
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                ticket = db.query(models.SupportTicket).filter(
                    models.SupportTicket.patient_id == patient.id,
                    models.SupportTicket.status == "ACTIVE"
                ).order_by(models.SupportTicket.created_at.desc()).first()
                if ticket:
                    add_support_message(db, ticket.id, "USER", body)
            finally:
                db.close()
            return

        # Handle Payment Selection
        if current_step == "awaiting_payment_selection":
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                if patient:
                    # Find the latest order awaiting payment selection
                    order = db.query(models.Order).filter(
                        models.Order.patient_id == patient.id,
                        models.Order.status == "AWAITING_PAYMENT_SELECTION"
                    ).order_by(models.Order.created_at.desc()).first()

                    if order:
                        logger.info(f"[SERVICE] Found order {order.token} for payment selection.")
                        if body == "1":  # COD
                            logger.info(f"[SERVICE] User {user_id} selected COD for order {order.token}")
                            order.payment_method = "COD"
                            order.status = "CONFIRMED"
                            order.payment_status = "PENDING_ON_DELIVERY"
                            db.commit()
                            self.twilio_wa.send_text(user_id, f"Order {order.token} confirmed! ✅\nYou chose Cash on Delivery. We will deliver your medicine shortly.")
                            UserState_wb.set_user_state(user_id, "main_menu")
                            return
                        elif body == "2":  # Online
                            logger.info(f"[SERVICE] User {user_id} selected ONLINE for order {order.token}")
                            order.payment_method = "ONLINE"
                            order.payment_provider = "PAYHERE"
                            order.status = "AWAITING_PAYMENT"
                            db.commit()

                            pay_url = self.payhere.generate_checkout_url(
                                order.token,
                                order.total_amount,
                                {"phone": user_id, "first_name": patient.name or "Valued"}
                            )

                            self.twilio_wa.send_text(user_id, f"Order {order.token} updated. 💳\n\nPlease use this secure link to complete your payment:\n{pay_url}\n\n⚠️ Payment must be made within 2 hours.")
                            UserState_wb.set_user_state(user_id, "main_menu")
                            return
                    else:
                        logger.warning(f"[SERVICE] No order awaiting payment selection found for patient {patient.id}")
                else:
                    logger.warning(f"[SERVICE] Patient not found for phone {user_id}")
            except Exception as e:
                logger.error(f"[SERVICE] Error in payment selection: {e}")
            finally:
                db.close()

        # Handle numeric menu selections in main_menu
        if current_step == "main_menu":
            menu_mapping = {"1": "order", "2": "doctor", "3": "disease", "4": "agent"}
            if body in menu_mapping:
                self._handle_button_click(user_id, menu_mapping[body])
                return

            if body in ["order medicine", "order now", "order"]:
                self.twilio_wa.send_text(
                    user_id,
                    "Please upload your prescription photo.\n\n_(Type 'menu' to return)_"
                )
                UserState_wb.set_user_state(user_id, "awaiting_prescription")
                return
            
            # Invalid input at main menu
            self.twilio_wa.send_text(
                user_id,
                "Please reply with 1, 2, 3, or 4."
            )
            return

        # Handle caption while awaiting prescription
        if current_step == "awaiting_prescription" or state.get("last_action") == "sending_image":
            logger.info(f"[WB_SERVICE] Ignoring potential caption text: '{body}'")
            return

        # Default fallback for unrecognized input
        self.twilio_wa.send_text(
            user_id, 
            "Sorry, I didn't understand that. \n\n_(Please type 'menu' to return)_"
        )

    def _handle_button_click(self, user_id: str, button_id: str):
        """
        Handle button clicks from interactive menus
        """
        logger.info(f"[WB_SERVICE] BUTTON_CLICK_HANDLER | User: {user_id} | Button: {button_id}")

        if button_id == "order":
            self.twilio_wa.send_text(
                user_id,
                "Please upload your prescription photo.\n\n_(Type 'menu' to return)_"
            )
            UserState_wb.set_user_state(user_id, "awaiting_prescription")

        elif button_id == "doctor":
            self._handle_doctor_button(user_id)

        elif button_id == "disease":
            logger.info(f"[WB_SERVICE] User {user_id} clicked DISEASE button")
            self._handle_disease_updates(user_id)

        elif button_id == "agent":
            self.send_agent_menu(user_id)

        elif button_id == "agent_chat":
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                create_support_ticket(db, patient)
            finally:
                db.close()

            UserState_wb.set_user_state(user_id, "waiting_for_agent")
            self.twilio_wa.send_text(user_id, "You have been added to the queue.\nPlease wait for an available agent.\nType 'menu' to return to main menu.")

            scheduler.add_job(
                check_agent_delay,
                'date',
                run_date=datetime.now() + timedelta(seconds=20),
                args=[user_id]
            )

        elif button_id == "agent_call":
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                close_all_user_tickets(db, patient)
            finally:
                db.close()
            self.twilio_wa.send_text(user_id, "You can contact the pharmacy at:\n📞 +94 11 234 5678\n\nType 'menu' to return to main menu.")
            UserState_wb.set_user_state(user_id, "main_menu")

        elif button_id == "agent_faq":
            self.send_faq_menu(user_id)

        elif button_id == "agent_continue":
            self.twilio_wa.send_text(user_id, "Thank you for your patience. An agent will be with you shortly.")

        elif button_id == "agent_back":
            self.send_agent_menu(user_id)

        elif button_id == "back_to_main":
            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                close_all_user_tickets(db, patient)
            finally:
                db.close()
            self.send_main_menu(user_id)

    def _handle_doctor_button(self, user_id: str):
        """
        Handles the doctor button click.
        Checks if there are any active doctors added via the pharmacy portal.
        If yes, sends the booking portal link. If no, sends a message to call.
        """
        logger.info(f"[WB_SERVICE] User {user_id} clicked DOCTOR button")
        from app.core.config import settings
        from app.channelling_models import Doctor

        db = SessionLocal()
        try:
            active_doctor_count = db.query(Doctor).filter(Doctor.available == True).count()
            is_enabled = active_doctor_count > 0
        except Exception as e:
            logger.error(f"[WB_SERVICE] Failed to check doctors: {e}")
            is_enabled = False
        finally:
            db.close()

        if not is_enabled:
            self.twilio_wa.send_text(
                user_id,
                (
                    "*Doctor Channelling*\n\n"
                    "This pharmacy doesn't offer online channelling just yet.\n\n"
                    "To book a doctor appointment, please reach us directly:\n"
                    "Call or WhatsApp the pharmacy\n\n"
                    "_(Type 'menu' to return)_"
                )
            )
            UserState_wb.set_user_state(user_id, "doctor_info")
            return

        message = (
            "*Book a Doctor Appointment*\n\n"
            "Ready to see a doctor? It's quick and easy!\n\n"
            "Visit our portal to choose your doctor and pick a time slot:\n"
            f"🔗 {settings.BASE_URL}/channel\n\n"
            "A small service fee is charged at booking.\n"
            "Consultation fee is paid directly at the hospital.\n\n"
            "_(Type 'menu' to return)_"
        )
        self.twilio_wa.send_text(user_id, message)
        UserState_wb.set_user_state(user_id, "doctor_info")

    def _handle_disease_updates(self, user_id: str):
        """
        Fetch and show active disease alerts.
        """
        logger.info(f"[WB_SERVICE] Handling Disease Updates for {user_id}")
        db = SessionLocal()
        try:
            from app.services import alert_service
            alerts = alert_service.get_all_active_alerts(db)

            if not alerts:
                msg = "There are currently no active MOH disease alerts. Stay safe! ✅"
            else:
                msg = "🔔 *Active MOH Disease Alerts:*\n\n"
                for alert in alerts:
                    msg += self.notifications.build_alert_message(alert) + "\n\n"
                msg += "Please follow MOH guidelines and take necessary precautions."

            self.twilio_wa.send_text(
                user_id,
                msg + "\n\n_(Type 'menu' to return)_"
            )
            UserState_wb.set_user_state(user_id, "disease_info")
        finally:
            db.close()

    def send_main_menu(self, user_id: str):
        """
        Send main menu
        """
        logger.info(f"[WB_SERVICE] MAIN_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "order",   "title": "Order Medicine"},
            {"id": "doctor",  "title": "Channel Doctor"},
            {"id": "disease", "title": "Disease Updates"},
            {"id": "agent",   "title": "Contact Agent"}
        ]

        res = self.twilio_wa.send_menu(
                user_id,
                "Please reply with 1, 2, 3, or 4.",
                buttons
            )

        logger.info(f"[WB_SERVICE] MAIN_MENU_SENT | User: {user_id} | Response: {res['status']}")
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
        self.twilio_wa.send_menu(user_id, "Please reply with 1, 2, or 3.", buttons)
        UserState_wb.set_user_state(user_id, "agent_menu")

    def send_delay_menu(self, user_id: str):
        """
        Send delay menu (20-second trigger)
        """
        logger.info(f"[WB_SERVICE] DELAY_MENU_SENT | User: {user_id}")
        buttons = [
            {"id": "agent_faq",      "title": "Try help bot"},
            {"id": "agent_continue", "title": "Continue waiting"},
            {"id": "agent_back",     "title": "Go back"}
        ]
        self.twilio_wa.send_menu(user_id, "We are experiencing a delay. Please choose:", buttons)
        UserState_wb.set_user_state(user_id, "agent_delay_menu")

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
            "Please reply with a number from 1 to 7."
        )
        self.twilio_wa.send_text(user_id, message)
        UserState_wb.set_user_state(user_id, "faq_mode")

    def _handle_faq_selection(self, user_id: str, selection: str):
        """
        Fetch real data from DB and answer FAQ questions
        """
        db = SessionLocal()
        try:
            # Fetch the main pharmacy record (there's only one pharmacy profile per instance)
            pharmacy = db.query(models.Pharmacy).first()
            msg = None

            if selection == "faq_hours":
                msg = f"📍 *Location & Hours*\n\n*Hours:* {pharmacy.opening_hours if pharmacy and pharmacy.opening_hours else 'Not set'}\n*Address:* {pharmacy.address if pharmacy and pharmacy.address else 'Not set'}"

            elif selection == "faq_delivery_areas":
                msg = (
                    f"🚚 *Delivery Service Areas*\n\n"
                    f"• Serving: {pharmacy.service_areas if pharmacy and pharmacy.service_areas else 'Most local areas'}\n"
                    f"• Est. Time: {pharmacy.estimated_delivery_time if pharmacy and pharmacy.estimated_delivery_time else '2-4 hours'}"
                )

            elif selection == "faq_prescription":
                msg = f"💊 *Prescription Requirements*\n\n{pharmacy.prescription_policy if pharmacy and pharmacy.prescription_policy else 'A valid prescription is required for most medicines. Please upload a clear photo of your prescription.'}"

            elif selection == "faq_order_status":
                patient = get_or_create_patient(db, phone=user_id)
                if patient:
                    order = db.query(models.Order).filter(
                        models.Order.patient_id == patient.id,
                        models.Order.status != "DELIVERED"
                    ).order_by(models.Order.created_at.desc()).first()

                    if order:
                        msg = f"📦 *Order Status*\n\nOrder Token: `{order.token}`\nCurrent Status: *{order.status}*\nPlaced on: {order.created_at.strftime('%Y-%m-%d')}"
                    else:
                        msg = "No active orders found for your number."
                else:
                    msg = "No patient profile found."

            elif selection == "faq_delivery_charges":
                msg = f"💰 *Delivery Charges*\n\nOur standard delivery charge is Rs. {pharmacy.service_charge if pharmacy and pharmacy.service_charge is not None else '150.00'}."

            elif selection == "faq_refunds":
                msg = f"📝 *Refund & Cancellation*\n\n{pharmacy.refund_policy if pharmacy and pharmacy.refund_policy else 'Please contact us for details regarding refunds and cancellations.'}"

            elif selection == "back_to_main":
                self.send_main_menu(user_id)
                return
            
            else:
                 # Fallback if selection doesn't match
                 self.send_faq_menu(user_id)
                 return

            if msg:
                faq_footer = "\n\n_(Reply 1-7 for another question, or type 'menu' to exit)_"
                self.twilio_wa.send_text(user_id, msg + faq_footer)

        finally:
            db.close()

    def _handle_image_message(self, user_id: str, message_data: dict):
        """
        Process incoming prescription image
        """
        media_url = message_data.get("media_url")
        UserState_wb.set_last_action(user_id, None)

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
            s3_key   = upload_prescription(presc_id, image_bytes)
            s3_url   = generate_presigned_url(s3_key)

            db = SessionLocal()
            try:
                patient = get_or_create_patient(db, phone=user_id)
                order, prescription = create_order_with_prescription(db, patient, s3_key, s3_url)
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
        patient = get_or_create_patient(db, phone=user_id)
        if not patient:
            logger.warning(f"[TIMER] Patient {user_id} not found in DB")
            return

        ticket = db.query(models.SupportTicket).filter(
            models.SupportTicket.patient_id == patient.id,
            models.SupportTicket.status == "WAITING"
        ).first()

        if ticket:
            state        = UserState_wb.get_user_state(user_id)
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