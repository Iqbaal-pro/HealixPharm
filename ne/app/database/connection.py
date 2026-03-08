from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import urllib.parse

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Angel@0602!")
DB_NAME = os.getenv("DB_NAME", "healixpharm")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")

DATABASE_URL = (
    f"mysql+mysqlconnector://root:{urllib.parse.quote_plus('Angel@0602!')}"
    f"@127.0.0.1:3306/healixpharm"
)

# Engine & Session
engine = create_engine(DATABASE_URL, echo=True, future=True)

SessionLocal = sessionmaker(
    autocommit=False,  # control when data is saved
    autoflush=False,   # prevents automatic writes before you're ready
    bind=engine
)

# Dependency for FastAPI routes and services
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
