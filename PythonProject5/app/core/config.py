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
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "healix")
    
    # Construct DATABASE_URL from components if available, else use raw URL
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    
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

settings = Settings()
