from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine for Channelling Database
engine_channelling = create_engine(settings.CHANNELLING_DATABASE_URL, pool_pre_ping=True)

# Session factory for Channelling Database
SessionChannelling = sessionmaker(autocommit=False, autoflush=False, bind=engine_channelling)

# Base class for Channelling models
# Note: Since models span two databases, we might reuse Base or have separate ones.
# To keep it clean, we'll use a separate Base for the channelling db.
BaseChannelling = declarative_base()

def get_channelling_db():
    """Yield a channelling database session."""
    db = SessionChannelling()
    try:
        yield db
    finally:
        db.close()
