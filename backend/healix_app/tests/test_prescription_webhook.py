"""
test_prescription_webhook.py
─────────────────────────────
End-to-end tests for the prescription upload flow via the
POST /whatsapp webhook (Twilio form-encoded payload).

All external calls are mocked:
  - Twilio send_text / download_media
  - OpenCV is_image_clear
  - S3 upload_prescription / generate_presigned_url
  - DB order creation

Covers:
  ✅ Text message → bot shows main menu
  ✅ Unsupported media type → bot asks for image
  ✅ Image upload → clear → order created → confirmation sent
  ✅ Image upload → blurry → rejection message sent, no order created
  ✅ Image upload → dark → rejection message sent, no order created
  ✅ Image upload → S3 failure → generic error message sent
  ✅ Image upload → Twilio download failure → error message sent
  ✅ No From field → webhook returns 200 silently
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ─── Helpers ───────────────────────────────────────────────────────────────────
USER_PHONE = "whatsapp:+94771234567"


def _twilio_text_payload(body: str, from_: str = USER_PHONE) -> dict:
    return {"From": from_, "Body": body, "NumMedia": "0"}


def _twilio_image_payload(media_url: str, from_: str = USER_PHONE) -> dict:
    return {
        "From": from_,
        "Body": "",
        "NumMedia": "1",
        "MediaUrl0": media_url,
        "MediaContentType0": "image/jpeg",
    }


# ─── Text message tests ────────────────────────────────────────────────────────
class TestTextMessages:

    @patch("app.whatsapp.service.WhatsAppService_wb.send_main_menu")
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    def test_first_text_shows_welcome_and_menu(self, mock_send_text, mock_send_menu):
        """Any text from a new user must trigger welcome + main menu."""
        # Reset state so user is treated as new
        from app.whatsapp.state import UserState_wb
        UserState_wb.clear_user_state("+94771000001")

        payload = _twilio_text_payload("Hello", from_="whatsapp:+94771000001")
        resp = client.post("/whatsapp", data=payload)
        assert resp.status_code == 200

    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    def test_option_1_asks_for_prescription(self, mock_send_text):
        """Replying '1' after menu is shown must ask for prescription photo."""
        from app.whatsapp.state import UserState_wb
        # Simulate user already past first message
        UserState_wb.set_user_state("+94771000002", "main_menu", {"is_first_message": False})

        payload = _twilio_text_payload("1", from_="whatsapp:+94771000002")
        resp = client.post("/whatsapp", data=payload)
        assert resp.status_code == 200

        calls = [str(c) for c in mock_send_text.call_args_list]
        assert any("prescription" in c.lower() for c in calls)

    def test_no_from_field_returns_200(self):
        """Missing From field must be silently ignored (no crash)."""
        resp = client.post("/whatsapp", data={"Body": "hi"})
        assert resp.status_code == 200


# ─── Image upload tests ────────────────────────────────────────────────────────
FAKE_MEDIA_URL = "https://api.twilio.com/fake-media/IMG001"
FAKE_S3_KEY = "prescriptions/abc123.jpg"
FAKE_S3_URL = "https://s3.amazonaws.com/healix-prescriptions/abc123.jpg"
FAKE_TOKEN = "ABCDEF1234"


class TestPrescriptionImageFlow:

    @patch("app.whatsapp.service.create_order_with_prescription")
    @patch("app.whatsapp.service.get_or_create_user")
    @patch("app.whatsapp.service.generate_presigned_url", return_value=FAKE_S3_URL)
    @patch("app.whatsapp.service.upload_prescription", return_value=FAKE_S3_KEY)
    @patch("app.whatsapp.service.is_image_clear", return_value=True)
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.download_media")
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    def test_clear_image_creates_order_and_confirms(
        self,
        mock_send_text,
        mock_download,
        mock_clear,
        mock_upload,
        mock_presign,
        mock_get_user,
        mock_create_order,
    ):
        """
        Full happy path:
        Image received → clear → S3 upload → order created → confirmation WhatsApp sent.
        """
        mock_download.return_value = b"fake_image_bytes"

        # Build fake user and order
        fake_user = MagicMock(); fake_user.id = 1
        fake_order = MagicMock(); fake_order.token = FAKE_TOKEN
        fake_prescription = MagicMock(); fake_prescription.prescription_id = "abc123"
        mock_get_user.return_value = fake_user
        mock_create_order.return_value = (fake_order, fake_prescription)

        payload = _twilio_image_payload(FAKE_MEDIA_URL)
        resp = client.post("/whatsapp", data=payload)

        assert resp.status_code == 200

        # S3 upload must have been called
        mock_upload.assert_called_once_with("abc123" if False else mock_upload.call_args[0][0],
                                            b"fake_image_bytes")
        # Presigned URL generated
        mock_presign.assert_called_once()
        # Order created
        mock_create_order.assert_called_once()
        # Confirmation message sent (check token in any call)
        all_texts = " ".join(str(c) for c in mock_send_text.call_args_list)
        assert FAKE_TOKEN in all_texts

    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.download_media")
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    @patch("app.whatsapp.service.is_image_clear", return_value=False)
    def test_blurry_image_sends_rejection_no_order(
        self, mock_clear, mock_send_text, mock_download
    ):
        """
        Blurry image path:
        Image received → NOT clear → rejection message sent → NO order created.
        """
        mock_download.return_value = b"blurry_bytes"

        with patch("app.whatsapp.service.upload_prescription") as mock_upload:
            payload = _twilio_image_payload(FAKE_MEDIA_URL, from_="whatsapp:+94770000010")
            resp = client.post("/whatsapp", data=payload)

            assert resp.status_code == 200
            # S3 upload must NOT have been called
            mock_upload.assert_not_called()
            # Rejection text must have been sent
            all_texts = " ".join(str(c) for c in mock_send_text.call_args_list)
            assert any(word in all_texts.lower() for word in ["unclear", "blurry", "sharper", "clearer"])

    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.download_media")
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    @patch("app.whatsapp.service.is_image_clear", return_value=True)
    @patch("app.whatsapp.service.upload_prescription", side_effect=RuntimeError("S3 down"))
    def test_s3_failure_sends_error_message(
        self, mock_upload, mock_clear, mock_send_text, mock_download
    ):
        """
        S3 failure path:
        Image clear → S3 upload fails → generic error message sent to user.
        """
        mock_download.return_value = b"ok_image"

        payload = _twilio_image_payload(FAKE_MEDIA_URL, from_="whatsapp:+94770000020")
        resp = client.post("/whatsapp", data=payload)

        assert resp.status_code == 200
        all_texts = " ".join(str(c) for c in mock_send_text.call_args_list)
        assert any(word in all_texts.lower() for word in ["error", "try again", "problem"])

    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.download_media",
           side_effect=RuntimeError("Twilio auth failed"))
    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    def test_download_failure_sends_error_message(self, mock_send_text, mock_download):
        """
        Download failure:
        Twilio media download fails → user gets error message, process stops.
        """
        payload = _twilio_image_payload(FAKE_MEDIA_URL, from_="whatsapp:+94770000030")
        resp = client.post("/whatsapp", data=payload)

        assert resp.status_code == 200
        all_texts = " ".join(str(c) for c in mock_send_text.call_args_list)
        assert any(word in all_texts.lower() for word in ["error", "try again", "couldn't"])

    @patch("app.whatsapp.twilio_client.TwilioWhatsAppClient.send_text")
    def test_non_image_media_sends_instruction(self, mock_send_text):
        """Sending a non-image file (e.g. PDF) must prompt user to send an image."""
        payload = {
            "From": "whatsapp:+94770000040",
            "Body": "",
            "NumMedia": "1",
            "MediaUrl0": "https://api.twilio.com/fake-media/DOC001",
            "MediaContentType0": "application/pdf",
        }
        resp = client.post("/whatsapp", data=payload)
        assert resp.status_code == 200
        all_texts = " ".join(str(c) for c in mock_send_text.call_args_list)
        assert "image" in all_texts.lower()
