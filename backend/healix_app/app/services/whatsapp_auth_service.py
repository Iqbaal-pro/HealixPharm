import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)

#from app.utils.encryption import encrypt_data

class WhatsAppAuthService:
    """
    Service for validating WhatsApp users against the registered patients database.
    """

    @staticmethod
    def is_authenticated(db: Session, phone_number: str) -> bool:
        """
        Check if a phone number corresponds to a registered patient.
        """
        patient = db.query(models.Patient).filter(
            models.Patient.phone_number == phone_number
        ).first()
        
        if patient:
            logger.info(f"[AUTH_SERVICE] Patient verified: {phone_number}")
            return True
        
        logger.warning(f"[AUTH_SERVICE] Authentication failed for: {phone_number}")
        return False
