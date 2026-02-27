"""
test_s3_service.py
──────────────────
Tests for app/services/s3_service.py

All AWS calls are mocked — no real S3 bucket is needed.

Covers:
  ✅ upload_prescription → calls put_object with correct key, bucket, body
  ✅ upload_prescription → returns the correct S3 key string
  ✅ generate_presigned_url → calls generate_presigned_url on S3 client
  ✅ generate_presigned_url → uses configurable expiry
  ✅ upload failure → RuntimeError propagates
"""
import pytest
from unittest.mock import patch, MagicMock
from app.services.s3_service import upload_prescription, generate_presigned_url


FAKE_BUCKET = "healix-prescriptions"
FAKE_REGION = "us-east-1"


def _settings_patch():
    """Return a mock settings object with S3 values pre-filled."""
    mock_settings = MagicMock()
    mock_settings.AWS_ACCESS_KEY_ID = "FAKE_KEY"
    mock_settings.AWS_SECRET_ACCESS_KEY = "FAKE_SECRET"
    mock_settings.AWS_S3_BUCKET = FAKE_BUCKET
    mock_settings.AWS_REGION = FAKE_REGION
    return mock_settings


class TestS3Upload:

    @patch("app.services.s3_service.settings", new_callable=lambda: type("S", (), {
        "AWS_ACCESS_KEY_ID": "K", "AWS_SECRET_ACCESS_KEY": "S",
        "AWS_S3_BUCKET": FAKE_BUCKET, "AWS_REGION": FAKE_REGION
    }))
    @patch("app.services.s3_service.boto3.client")
    def test_upload_prescription_puts_object(self, mock_boto_client, _mock_settings):
        """upload_prescription must call put_object with the right key and bucket."""
        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        presc_id = "abc123"
        image_bytes = b"fake_image_data"
        key = upload_prescription(presc_id, image_bytes)

        expected_key = f"prescriptions/{presc_id}.jpg"
        mock_s3.put_object.assert_called_once_with(
            Bucket=FAKE_BUCKET,
            Key=expected_key,
            Body=image_bytes,
            ContentType="image/jpeg",
        )
        assert key == expected_key

    @patch("app.services.s3_service.settings", new_callable=lambda: type("S", (), {
        "AWS_ACCESS_KEY_ID": "K", "AWS_SECRET_ACCESS_KEY": "S",
        "AWS_S3_BUCKET": FAKE_BUCKET, "AWS_REGION": FAKE_REGION
    }))
    @patch("app.services.s3_service.boto3.client")
    def test_upload_prescription_returns_key(self, mock_boto_client, _mock_settings):
        """upload_prescription must return the S3 key string."""
        mock_boto_client.return_value = MagicMock()
        key = upload_prescription("xyz999", b"data")
        assert key == "prescriptions/xyz999.jpg"

    @patch("app.services.s3_service.settings", new_callable=lambda: type("S", (), {
        "AWS_ACCESS_KEY_ID": "K", "AWS_SECRET_ACCESS_KEY": "S",
        "AWS_S3_BUCKET": FAKE_BUCKET, "AWS_REGION": FAKE_REGION
    }))
    @patch("app.services.s3_service.boto3.client")
    def test_generate_presigned_url_called(self, mock_boto_client, _mock_settings):
        """generate_presigned_url must call S3's generate_presigned_url with correct params."""
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = "https://fake-url.s3.amazonaws.com/key"
        mock_boto_client.return_value = mock_s3

        url = generate_presigned_url("prescriptions/abc123.jpg")

        mock_s3.generate_presigned_url.assert_called_once_with(
            "get_object",
            Params={"Bucket": FAKE_BUCKET, "Key": "prescriptions/abc123.jpg"},
            ExpiresIn=3600,
        )
        assert url == "https://fake-url.s3.amazonaws.com/key"

    @patch("app.services.s3_service.settings", new_callable=lambda: type("S", (), {
        "AWS_ACCESS_KEY_ID": "K", "AWS_SECRET_ACCESS_KEY": "S",
        "AWS_S3_BUCKET": FAKE_BUCKET, "AWS_REGION": FAKE_REGION
    }))
    @patch("app.services.s3_service.boto3.client")
    def test_generate_presigned_url_custom_expiry(self, mock_boto_client, _mock_settings):
        """generate_presigned_url must respect a custom expires_in value."""
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = "https://url"
        mock_boto_client.return_value = mock_s3

        generate_presigned_url("prescriptions/def456.jpg", expires_in=7200)

        _, kwargs = mock_s3.generate_presigned_url.call_args
        assert kwargs["ExpiresIn"] == 7200

    @patch("app.services.s3_service.settings", new_callable=lambda: type("S", (), {
        "AWS_ACCESS_KEY_ID": "K", "AWS_SECRET_ACCESS_KEY": "S",
        "AWS_S3_BUCKET": FAKE_BUCKET, "AWS_REGION": FAKE_REGION
    }))
    @patch("app.services.s3_service.boto3.client")
    def test_upload_failure_raises(self, mock_boto_client, _mock_settings):
        """An S3 error during upload must propagate as an exception."""
        mock_s3 = MagicMock()
        mock_s3.put_object.side_effect = RuntimeError("S3 connection refused")
        mock_boto_client.return_value = mock_s3

        with pytest.raises(RuntimeError, match="S3 connection refused"):
            upload_prescription("fail_id", b"data")
