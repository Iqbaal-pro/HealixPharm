from sqlalchemy import Column, Integer, String, TIMESTAMP, text
from app.database.declarative_base import Base

class WhatsAppUser(Base):
    __tablename__ = "whatsapp_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True, unique=True, index=True)
    role = Column(String(20), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), nullable=True)

    def __repr__(self):
        return f"<WhatsAppUser id={self.id} name='{self.name}' phone='{self.phone_number}'>"
