import os
import boto3
import logging
from botocore.client import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", os.getenv("AWS_ACCESS_KEY_ID")),
        aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", os.getenv("AWS_SECRET_ACCESS_KEY")),
        region_name=getattr(settings, "AWS_REGION", os.getenv("AWS_REGION", "us-east-1")),
        config=Config(signature_version="s3v4")
    )

def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    """
    Generate a presigned URL to view a prescription image stored in S3.
    """
    s3 = get_s3_client()
    bucket = getattr(settings, "AWS_S3_BUCKET", os.getenv("AWS_S3_BUCKET", "healix-prescriptions"))
    
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in
    )
    logger.info(f"[S3_SERVICE] Generated presigned URL for key {key} (expires_in={expires_in})")
    return url
