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
        Note: Because phone numbers are encrypted non-deterministically, 
        we must compare them in-memory after decryption.
        """
        # For small-scale patient list (< 10,000), in-memory matching is efficient.
        patients = db.query(models.Patient).all()
        for patient in patients:
            if patient.phone_number == phone_number:
                logger.info(f"[AUTH_SERVICE] Patient verified: {phone_number}")
                return True

        
        logger.warning(f"[AUTH_SERVICE] Authentication failed for: {phone_number}")
        return False
