from sqlalchemy.orm import Session
from app.models.whatsapp_user import WhatsAppUser

class WhatsAppUserRepo:
    @staticmethod
    def get_by_phone(db: Session, phone_number: str) -> WhatsAppUser | None:
        """Fetch a WhatsApp user by their phone number."""
        return db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
