import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Meta WhatsApp Configuration
    VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "HEAL")
    WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
    PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "973507845836211")
    
    # Meta Graph API
    META_API_VERSION = "v18.0"
    META_GRAPH_URL = f"https://graph.facebook.com/{META_API_VERSION}"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///healix.db")
    
    # Server
    SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

settings = Settings()
