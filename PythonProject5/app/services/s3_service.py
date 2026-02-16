import boto3
import logging
from botocore.client import Config
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4")
    )


def upload_prescription(prescription_id: str, image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    """
    Upload prescription image bytes to S3 under prescriptions/{prescription_id}.jpg
    Returns the S3 key of the uploaded object.
    """
    s3 = get_s3_client()
    key = f"prescriptions/{prescription_id}.jpg"
    logger.info(f"[S3_SERVICE] Uploading prescription to s3://{settings.AWS_S3_BUCKET}/{key}")
    s3.put_object(Bucket=settings.AWS_S3_BUCKET, Key=key, Body=image_bytes, ContentType=content_type)
    logger.info("[S3_SERVICE] Upload successful")
    return key


def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expires_in
    )
    logger.info(f"[S3_SERVICE] Generated presigned URL (expires_in={expires_in})")
    return url
