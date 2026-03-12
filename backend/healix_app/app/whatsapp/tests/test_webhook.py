import pytest
import logging
from app.whatsapp.meta_client import MetaClient_wb
from app.whatsapp.state import UserState_wb
from app.whatsapp.service import WhatsAppService_wb

logger = logging.getLogger(__name__)

class TestWebhookVerification_wb:
    """
    PHASE 1: Test webhook verification
    All classes and methods identified with _wb suffix for WhatsApp Bot
    """

    def test_meta_client_initialized(self):
        """
        Test MetaClient_wb can be instantiated
        """
        logger.info("[WB_TEST] Testing MetaClient_wb initialization")
        client = MetaClient_wb()
        assert client.token is not None
        assert client.phone_number_id is not None
        logger.info("[WB_TEST] MetaClient_wb initialized successfully")

    def test_user_state_creation(self):
        """
        Test UserState_wb tracking
        """
        logger.info("[WB_TEST] Testing UserState_wb creation")
        user_id = "test_user_123"
        state = UserState_wb.get_user_state(user_id)
        assert state["current_step"] == "main_menu"
        assert "conversation_data" in state
        logger.info("[WB_TEST] UserState_wb created successfully")

    def test_user_state_update(self):
        """
        Test updating user state
        """
        logger.info("[WB_TEST] Testing UserState_wb update")
        user_id = "test_user_456"
        UserState_wb.set_user_state(user_id, "awaiting_prescription", {"order_id": 1})
        state = UserState_wb.get_user_state(user_id)
        assert state["current_step"] == "awaiting_prescription"
        assert state["conversation_data"]["order_id"] == 1
        logger.info("[WB_TEST] UserState_wb updated successfully")

    def test_service_initialization(self):
        """
        Test WhatsAppService_wb can be instantiated
        """
        logger.info("[WB_TEST] Testing WhatsAppService_wb initialization")
        service = WhatsAppService_wb()
        assert service.meta is not None
        logger.info("[WB_TEST] WhatsAppService_wb initialized successfully")

    def test_main_menu_sent(self):
        """
        Test main menu can be composed
        """
        logger.info("[WB_TEST] Testing main menu composition")
        service = WhatsAppService_wb()
        # Verify service has method to send menu
        assert hasattr(service, "send_main_menu")
        logger.info("[WB_TEST] Main menu method exists on WhatsAppService_wb")
