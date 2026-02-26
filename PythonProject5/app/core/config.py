import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Twilio WhatsApp Configuration
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "+14155238886")
    TWILIO_WHATSAPP_WEBHOOK_TOKEN = os.getenv("TWILIO_WHATSAPP_WEBHOOK_TOKEN", "HEAL")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///healix.db")
    
    # AWS S3
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "healix-prescriptions")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

    # Twilio SMS (fallback notifications)
    TWILIO_SMS_FROM_NUMBER = os.getenv("TWILIO_SMS_FROM_NUMBER", "")
    
    # Server
    SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # Spreading Disease Alert System
    ALERT_JOB_INTERVAL_MINS = int(os.getenv("ALERT_JOB_INTERVAL_MINS", 30))
    ALERT_SUCCESS_THRESHOLD = float(os.getenv("ALERT_SUCCESS_THRESHOLD", 0.90))
    ALERT_MIN_THREAT_LEVEL = os.getenv("ALERT_MIN_THREAT_LEVEL", "High")
    ALERT_MESSAGE_TEMPLATE = os.getenv(
        "ALERT_MESSAGE_TEMPLATE", 
        "ALERT: {disease_name} in {region}. Threat: {threat_level}. Take precautions. Source: MOH"
    )

settings = Settings()
