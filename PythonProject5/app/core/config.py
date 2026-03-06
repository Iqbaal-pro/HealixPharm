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
    
    # E-Channelling
    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
    CHANNELLING_DATABASE_URL = os.getenv("CHANNELLING_DATABASE_URL", "sqlite:///channelling.db")
    
    # PayHere
    PAYHERE_MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "")
    PAYHERE_SECRET = os.getenv("PAYHERE_SECRET", "")
    PAYHERE_BASE_URL = os.getenv("PAYHERE_BASE_URL", "https://sandbox.payhere.lk/pay/checkout")
    PAYHERE_SANDBOX = os.getenv("PAYHERE_SANDBOX", "True").lower() == "true"

    # Stock Management DB (MySQL)
    STOCK_DB_USER = os.getenv("STOCK_DB_USER", "stock_user")
    STOCK_DB_PASSWORD = os.getenv("STOCK_DB_PASSWORD", "stock123")
    STOCK_DB_HOST = os.getenv("STOCK_DB_HOST", "127.0.0.1")
    STOCK_DB_PORT = int(os.getenv("STOCK_DB_PORT", 3306))
    STOCK_DB_NAME = os.getenv("STOCK_DB_NAME", "stock_management_db")

    # PayHere Configuration
    PAYHERE_MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "need_to_be_fill")
    PAYHERE_MERCHANT_SECRET = os.getenv("PAYHERE_MERCHANT_SECRET", "need_to_be_fill")
    PAYHERE_NOTIFY_URL = os.getenv("PAYHERE_NOTIFY_URL", "need_to_be_fill")
    PAYHERE_SANDBOX = os.getenv("PAYHERE_SANDBOX", "True").lower() == "true"
    PAYHERE_CURRENCY = os.getenv("PAYHERE_CURRENCY", "LKR")

    @property
    def STOCK_DATABASE_URL(self):
        return f"mysql+mysqlconnector://{self.STOCK_DB_USER}:{self.STOCK_DB_PASSWORD}@{self.STOCK_DB_HOST}:{self.STOCK_DB_PORT}/{self.STOCK_DB_NAME}"

settings = Settings()
