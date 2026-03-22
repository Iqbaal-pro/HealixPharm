import os
from dotenv import load_dotenv

# Load .env from stock_management root (two levels up from app/core/)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

class Settings:
    # ─── Railway Database ───────────────────────────────────────
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "railway")

    # Construct DATABASE_URL
    @property
    def DATABASE_URL(self):
        return f"mysql+mysqlconnector://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # ─── Encryption ───────────────────────────────────────────
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "xvLGCSII8i_3daoPlLoMePD_jtIScXT3M2Z1CO8qb-8=")

    # ─── SMS API (SmsApi.lk) ──────────────────────────────────
    SMS_API_KEY = os.getenv("SMS_API_KEY")
    SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "Notify")

    # ─── Auth ───────────────────────────────────────────────
    AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "healix_pharm_secret_key_2024_secure_v2")

settings = Settings()
