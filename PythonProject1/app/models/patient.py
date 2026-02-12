from sqlalchemy import Column, Integer, String
from app.database.declarative_base import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    language = Column(String, nullable=True)
