from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database.base import Base
from app.utils.encryption import encrypt_data, decrypt_data


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
    
    language = Column(String(10), default="en")  # e.g. "en", "si", "ta"
    consent = Column(Boolean, default=False)      # must be True to send SMS
    _age = Column("age", String(600), nullable=True) # Encrypted age
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- name ---
    @property
    def name(self) -> str:
        """Return decrypted patient name."""
        return decrypt_data(self._name)

    @name.setter
    def name(self, value: str):
        """Encrypt and store patient name."""
        self._name = encrypt_data(value)

    # --- phone_number ---
    @property
    def phone_number(self) -> str:
        """Return decrypted phone number."""
        return decrypt_data(self._phone_number)

    @phone_number.setter
    def phone_number(self, value: str):
        """Encrypt and store phone number."""
        self._phone_number = encrypt_data(value)

    # --- date_of_birth ---
    @property
    def date_of_birth(self) -> str:
        """Return decrypted date of birth."""
        return decrypt_data(self._date_of_birth)

    @date_of_birth.setter
    def date_of_birth(self, value: str):
        """Encrypt and store date of birth."""
        self._date_of_birth = encrypt_data(value)

    # --- age ---
    @property
    def age(self) -> int:
        """Return decrypted age as int."""
        val = decrypt_data(self._age)
        return int(val) if val else None

    @age.setter
    def age(self, value: int):
        """Encrypt and store age."""
        self._age = encrypt_data(str(value))

    def __repr__(self):
        return f"<Patient id={self.id} name='{self.name}'>"
