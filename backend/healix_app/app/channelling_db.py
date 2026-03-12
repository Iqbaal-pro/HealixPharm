from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Use MySQL for channelling (same server, separate database)
CHANNELLING_DB_URL = settings.CHANNELLING_DATABASE_URL

engine_channelling = create_engine(
    CHANNELLING_DB_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocalChannelling = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_channelling
)

BaseChannelling = declarative_base()

def get_db_channelling():
    """Yield a database session for the channelling database."""
    db = SessionLocalChannelling()
    try:
        yield db
    finally:
        db.close()