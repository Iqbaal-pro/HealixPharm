import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

USER_DB_USER = os.getenv("USER_DB_USER", os.getenv("DB_USER", "stock_user"))
USER_DB_PASSWORD = os.getenv("USER_DB_PASSWORD", os.getenv("DB_PASSWORD", "stock123"))
USER_DB_HOST = os.getenv("USER_DB_HOST", os.getenv("DB_HOST", "127.0.0.1"))
USER_DB_PORT = os.getenv("USER_DB_PORT", os.getenv("DB_PORT", "3306"))
USER_DB_NAME = os.getenv("USER_DB_NAME", "user_management")

USER_DATABASE_URL = (
    f"mysql+mysqlconnector://{USER_DB_USER}:{USER_DB_PASSWORD}"
    f"@{USER_DB_HOST}:{USER_DB_PORT}/{USER_DB_NAME}"
)

user_engine = create_engine(USER_DATABASE_URL, echo=True)

UserSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=user_engine
)
