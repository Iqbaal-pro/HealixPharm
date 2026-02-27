from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB_USER = "stock_user"
DB_PASSWORD = "stock123"
DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_NAME = "stock_management_db"

DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
