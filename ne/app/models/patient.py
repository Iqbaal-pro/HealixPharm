import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from sqlalchemy import Column, Integer, String
from app.database.declarative_base import Base
from app.utils.encryption import encrypt_data, decrypt_data


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    # Internal (encrypted) columns — prefixed with underscore
    _name = Column("name", String(600), nullable=False)
    _phone_number = Column("phone_number", String(600), nullable=False)
    _date_of_birth = Column("date_of_birth", String(600), nullable=True)
    language = Column(String(200), nullable=True)

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

    def __repr__(self):
        return f"<Patient id={self.id} name='{self.name}'>"
