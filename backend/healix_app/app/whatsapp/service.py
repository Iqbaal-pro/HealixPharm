import logging
from datetime import datetime, timedelta
from app.whatsapp.twilio_client import TwilioWhatsAppClient
from app.whatsapp.state import UserState_wb
from app.services.image_service import is_image_clear
from app.services.s3_service import upload_prescription, generate_presigned_url
from app.services.order_service import get_or_create_patient, create_order_with_prescription, create_support_ticket, close_all_user_tickets, add_support_message
from app.services.notification_service import NotificationService
from app.services.payhere_service import PayHereService
# from app.services.whatsapp_auth_service import WhatsAppAuthService
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
        # db = SessionLocal()
        # try:
        #     if not WhatsAppAuthService.is_authenticated(db, user_id):
        #         logger.warning(f"[WB_SERVICE] Access denied for unregistered user: {user_id}")
        #         self.twilio_wa.send_text(user_id, "Sorry, this service is only available for registered patients of Healix Pharm. Please contact the pharmacy to register.")
        #         return
        # finally:
        #     db.close()

        state = UserState_wb.get_user_state(user_id)
        is_first = state.get("is_first_message", False)

        if is_first:
            logger.info(f"[WB_SERVICE] First interaction from user {user_id}")
            UserState_wb.set_user_state(user_id, state["current_step"], {"is_first_message": False})

            self.twilio_wa.send_text(user_id, "Welcome to HealixPharm")

            guidance = (
                "📖 *How to use Healix Pharm Bot:*\n\n"
                "1️⃣ *Select* an option from the menu below.\n\n"
                "2️⃣ *Follow* the prompts (e.g., upload prescription).\n\n"
                "3️⃣ *Type* 'menu' or 'hi' anytime to return home."
            )
            self.twilio_wa.send_text(user_id, guidance)
            self.send_main_menu(user_id)
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
        
        # Universal Back to Main Menu handler
        if body == "1" and current_step in ["disease_info", "doctor_info"]:
            logger.info(f"[WB_SERVICE] User {user_id} selected Back to Main Menu")
            self.send_main_menu(user_id)
            return
        
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
                ).first()
                if ticket:
                    add_support_message(db, ticket.id, "USER", body)
            finally:
                db.close()
            return

        # Handle Payment Selection
        if current_step == "awaiting_payment_selection":
            db = SessionLocal()
            try:
                patient = db.query(models.Patient).filter(models.Patient.phone_number == user_id).first()
                if patient:
                    order = db.query(models.Order).filter(
                        models.Order.patient_id == patient.id,
                        models.Order.status == "AWAITING_PAYMENT_SELECTION"
                    ).order_by(models.Order.created_at.desc()).first()

                    if order:
                        if body == "1":  # COD
                            order.payment_method = "COD"
                            order.status = "CONFIRMED"
                            order.payment_status = "PENDING_ON_DELIVERY"
                            db.commit()
                            self.twilio_wa.send_text(user_id, f"Order {order.token} confirmed! ✅\nYou chose Cash on Delivery. We will deliver your medicine shortly.")
                            UserState_wb.set_user_state(user_id, "main_menu")
                            return
                        elif body == "2":  # Online
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
            finally:
                db.close()

        # Handle numeric menu selections in main_menu
        if current_step == "main_menu":
            menu_mapping = {"1": "order", "2": "doctor", "3": "disease", "4": "agent"}
            if body in menu_mapping:
                self._handle_button_click(user_id, menu_mapping[body])
                return

            if body in ["order medicine", "order now", "order"]:
                self.twilio_wa.send_menu(
                    user_id,
                    "Please upload your prescription photo.",
                    [{"id": "back_to_main", "title": "Back to Main Menu"}]
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
            "Please type 1 to go back to the Main Menu, or type menu anytime."
        )

    def _handle_button_click(self, user_id: str, button_id: str):
        """
        Handle button clicks from interactive menus
        """
        logger.info(f"[WB_SERVICE] BUTTON_CLICK_HANDLER | User: {user_id} | Button: {button_id}")

        if button_id == "order":
            self.twilio_wa.send_menu(
                user_id,
                "Please upload your prescription photo.",
                [{"id": "back_to_main", "title": "Back to Main Menu"}]
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
        Checks if eChannelling is enabled for this pharmacy first.
        """
        logger.info(f"[WB_SERVICE] User {user_id} clicked DOCTOR button")
        from app.core.config import settings
        from app.db import SessionLocal
        from app import models

        db = SessionLocal()
        try:
            setting    = db.query(models.PharmacySetting).filter_by(key="echannelling_enabled").first()
            is_enabled = setting and setting.value.strip().lower() == "true"
        finally:
            db.close()

        if not is_enabled:
            self.twilio_wa.send_menu(
                user_id,
                (
                    "*Doctor Channelling*\n\n"
                    "This pharmacy doesn't offer online channelling just yet.\n\n"
                    "To book a doctor appointment, please reach us directly:\n"
                    "Call or WhatsApp the pharmacy\n\n"
                    "Type *menu* anytime to go back."
                ),
                [{"id": "back_to_main", "title": "Back to Main Menu"}]
            )
            UserState_wb.set_user_state(user_id, "doctor_info")
            return

        message = (
            "*Book a Doctor Appointment*\n\n"
            "Ready to see a doctor? It's quick and easy!\n\n"
            "Visit our portal to choose your doctor and pick a time slot:\n"
            f"🔗 {settings.BASE_URL}/channelling\n\n"
            "A small service fee is charged at booking.\n"
            "Consultation fee is paid directly at the hospital.\n\n"
            "Need help? Type *agent* to chat with us, or *menu* to go back."
        )
        self.twilio_wa.send_menu(
            user_id,
            message,
            [{"id": "back_to_main", "title": "Back to Main Menu"}]
        )
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
                    msg += (
                        f"⚠️ *{alert.disease_name}*\n"
                        f"📍 Region: {alert.region}\n"
                        f"📊 Level: {alert.threat_level}\n"
                        f"📅 Until: {alert.end_date.strftime('%Y-%m-%d')}\n\n"
                    )
                msg += "Please follow MOH guidelines and take necessary precautions."

            self.twilio_wa.send_menu(
                user_id,
                msg,
                [{"id": "back_to_main", "title": "Back to Main Menu"}]
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
        self.twilio_wa.send_menu(user_id, "Please choose an option:", buttons)
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
            if selection == "faq_hours":
                hours = db.query(models.PharmacySetting).filter_by(key="opening_hours").first()
                loc   = db.query(models.PharmacySetting).filter_by(key="location").first()
                msg   = f"📍 *Location & Hours*\n\n*Hours:* {hours.value if hours else 'Not set'}\n*Address:* {loc.value if loc else 'Not set'}"
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
                patient = db.query(models.Patient).filter_by(phone_number=user_id).first()
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
        patient = db.query(models.Patient).filter(models.Patient.phone_number == user_id).first()
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