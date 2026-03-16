from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings

# Initialize Fernet with the encryption key from settings
try:
    fernet = Fernet(settings.ENCRYPTION_KEY)
except Exception as e:
    raise RuntimeError(f"Invalid ENCRYPTION_KEY in settings: {e}")


def encrypt_data(plain_text: Optional[str]) -> Optional[str]:
    """Encrypt plain text data."""
    if plain_text is None:
        return None
    return fernet.encrypt(plain_text.encode()).decode()


def decrypt_data(cipher_text: Optional[str]) -> Optional[str]:
    """Decrypt cipher text data. Returns None if decryption fails."""
    if cipher_text is None:
        return None
    try:
        return fernet.decrypt(cipher_text.encode()).decode()
    except Exception as e:
        # Do NOT return raw cipher text — signal failure with None
        raise ValueError(f"Decryption failed. Data may be corrupted or key mismatch: {e}")
