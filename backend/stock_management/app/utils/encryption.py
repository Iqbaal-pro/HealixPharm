from cryptography.fernet import Fernet
from app.core.config import settings

# Initialize Fernet with the encryption key from settings
fernet = Fernet(settings.ENCRYPTION_KEY)

from typing import Optional

def encrypt_data(plain_text: Optional[str]) -> Optional[str]:
    """Encrypt plain text data."""
    if plain_text is None:
        return None
    return fernet.encrypt(plain_text.encode()).decode()

def decrypt_data(cipher_text: Optional[str]) -> Optional[str]:
    """Decrypt cipher text data."""
    if cipher_text is None:
        return None
    try:
        return fernet.decrypt(cipher_text.encode()).decode()
    except Exception:
        # Fallback or error handling if decryption fails
        return cipher_text
