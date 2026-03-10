from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine for the separate channelling database
engine_channelling = create_engine(
    settings.CHANNELLING_DATABASE_URL, 
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.CHANNELLING_DATABASE_URL else {}
)

# Session factory for channelling
SessionLocalChannelling = sessionmaker(autocommit=False, autoflush=False, bind=engine_channelling)

# Base class for channelling models (isolated from pharmacy Base)
BaseChannelling = declarative_base()

def get_db_channelling():
    """Yield a database session for the channelling database."""
    db = SessionLocalChannelling()
    try:
        yield db
    finally:
        db.close()
