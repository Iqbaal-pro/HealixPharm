# app/tests/test_encryption.py
"""
Tests for patient data encryption.
Verifies that patient PII is encrypted at rest and decrypted on access.
"""
import sys
import os

# Ensure the 'ne' folder (project root) is in sys.path so 'app.' imports work when run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from app.models.patient import Patient
from app.utils.encryption import encrypt_data, decrypt_data


class TestEncryptionUtils:
    """Unit tests for the encrypt_data / decrypt_data helpers."""

    def test_encrypt_returns_different_value(self):
        plain = "Muhammed Iqbaal Meedin"
        cipher = encrypt_data(plain)
        assert cipher != plain

    def test_decrypt_recovers_original(self):
        plain = "Muhammed Iqbaal Meedin"
        cipher = encrypt_data(plain)
        assert decrypt_data(cipher) == plain

    def test_encrypt_none_returns_none(self):
        assert encrypt_data(None) is None

    def test_decrypt_none_returns_none(self):
        assert decrypt_data(None) is None

    def test_different_encryptions_of_same_value(self):
        """Fernet includes a timestamp so each encryption is unique."""
        plain = "test"
        assert encrypt_data(plain) != encrypt_data(plain)


class TestPatientEncryption:
    """Integration-style tests for the Patient model property encryption."""

    def _make_patient(self) -> Patient:
        p = Patient()
        p.name = "Muhammed Iqbaal Meedin"
        p.phone_number = "+94717360715"
        p.date_of_birth = "1990-01-01"
        p.language = "en"
        return p

    def test_raw_columns_are_encrypted(self):
        p = self._make_patient()
        # Internal _name/_phone_number/_date_of_birth should NOT be plain text
        assert p._name != "Muhammed Iqbaal Meedin"
        assert p._phone_number != "+94717360715"
        assert p._date_of_birth != "1990-01-01"
        # language should be plain text
        assert p.language == "en"

    def test_properties_return_plain_text(self):
        p = self._make_patient()
        assert p.name == "Muhammed Iqbaal Meedin"
        assert p.phone_number == "+94717360715"
        assert p.date_of_birth == "1990-01-01"
        assert p.language == "en"

    def test_update_name_re_encrypts(self):
        p = self._make_patient()
        old_cipher = p._name
        p.name = "New Name"
        assert p._name != old_cipher       # cipher changed
        assert p.name == "New Name"        # plain text correct

    def test_repr_shows_plain_name(self):
        p = self._make_patient()
        assert "Muhammed Iqbaal Meedin" in repr(p)

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
