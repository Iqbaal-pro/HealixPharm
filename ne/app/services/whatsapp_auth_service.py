from sqlalchemy.orm import Session
from app.repositories.whatsapp_user_repo import WhatsAppUserRepo

class WhatsAppAuthService:
    @staticmethod
    def is_authenticated(db: Session, phone_number: str) -> bool:
        """
        Check if a phone number is registered in the whatsapp_users table.
        Returns True if authenticated, False otherwise.
        """
        user = WhatsAppUserRepo.get_by_phone(db, phone_number)
        return user is not None
