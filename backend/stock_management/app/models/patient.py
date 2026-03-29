import logging
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database.base import Base
from app.utils.encryption import encrypt_data, decrypt_data

logger = logging.getLogger(__name__)


def _safe_decrypt(cipher_text, field_name: str):
    """Attempt decryption; log a warning and return None on failure."""
    try:
        return decrypt_data(cipher_text)
    except ValueError as e:
        logger.warning(f"[Patient] Decryption failed for field '{field_name}': {e}")
        return None


class Patient(Base):
    """
    Stores patient information for reminder/consent management.
    Sensitive data (name, phone, DOB) is encrypted in the database.
    """
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(String(255), unique=True, index=True, nullable=True)

    # Internal (encrypted) columns mapped to the database
    _name = Column("name", String(600), nullable=False)
    _phone_number = Column("phone_number", String(600), nullable=False)
    _date_of_birth = Column("date_of_birth", String(600), nullable=True)

    _language = Column("language", String(600), default="en")
    consent = Column(Boolean, default=False)      # must be True to send SMS
    _age = Column("age", String(600), nullable=True)  # Encrypted age

    created_at = Column(DateTime, default=datetime.utcnow)

    # --- language ---
    @property
    def language(self) -> str:
        """Hybrid: Decrypt if encrypted (starts with gAAAAA), else return raw."""
        val = self._language
        if val and isinstance(val, str) and val.startswith("gAAAAA"):
            return _safe_decrypt(val, "language") or val
        return val

    @language.setter
    def language(self, value: str):
        """Store as plain text (e.g., 'en', 'si', 'ta')."""
        self._language = value

    # --- name ---
    @property
    def name(self) -> str:
        """Return decrypted patient name."""
        return _safe_decrypt(self._name, "name")

    @name.setter
    def name(self, value: str):
        """Encrypt and store patient name."""
        self._name = encrypt_data(value)

    # --- phone_number ---
    @property
    def phone_number(self) -> str:
        """Return decrypted phone number."""
        return _safe_decrypt(self._phone_number, "phone_number")

    @phone_number.setter
    def phone_number(self, value: str):
        """Encrypt and store phone number."""
        self._phone_number = encrypt_data(value)

    # --- date_of_birth ---
    @property
    def date_of_birth(self) -> str:
        """Return decrypted date of birth."""
        return _safe_decrypt(self._date_of_birth, "date_of_birth")

    @date_of_birth.setter
    def date_of_birth(self, value: str):
        """Encrypt and store date of birth."""
        self._date_of_birth = encrypt_data(value)

    # --- age ---
    @property
    def age(self) -> int:
        """Return decrypted age as int."""
        val = _safe_decrypt(self._age, "age")
        return int(val) if val else None

    @age.setter
    def age(self, value: int):
        """Encrypt and store age."""
        self._age = encrypt_data(str(value))

    def __repr__(self):
        return f"<Patient id={self.id} name='{self.name}'>"
