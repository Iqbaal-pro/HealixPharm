from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    dosage_form = Column(String(50), nullable=False)
    strength = Column(String(50), nullable=True)
