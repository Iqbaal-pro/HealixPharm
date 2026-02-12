from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")

# Fail fast if critical variables are missing
if not DB_USER or not DB_PASSWORD or not DB_NAME:
    raise RuntimeError(
        "Database configuration incomplete. "
        "Please set DB_USER, DB_PASSWORD, and DB_NAME environment variables."
    )

DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Engine & Session
engine = create_engine(DATABASE_URL, echo=True, future=True)

SessionLocal = sessionmaker(
    autocommit=False,#control when data is saved
    autoflush=False, #Prevents automatic writes before you’re ready.
    bind=engine
)

# Dependency for FastAPI / services
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
