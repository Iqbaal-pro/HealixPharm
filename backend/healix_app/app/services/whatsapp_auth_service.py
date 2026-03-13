import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)

from app.utils.encryption import encrypt_data

class WhatsAppAuthService:
    """
    Service for validating WhatsApp users against the registered patients database.
    """

    @staticmethod
    def is_authenticated(db: Session, phone_number: str) -> bool:
        """
        Check if a phone number corresponds to an active registered patient.
        """
        # Encrypt the search term to match the database column
        encrypted_phone = encrypt_data(phone_number)
        
        patient = db.query(models.Patient).filter(
            models.Patient._phone_number == encrypted_phone,
            models.Patient.is_active == True
        ).first()
        
        if patient:
            logger.info(f"[AUTH_SERVICE] Patient verified: {phone_number}")
            return True
        
        logger.warning(f"[AUTH_SERVICE] Authentication failed for: {phone_number}")
        return False
