# app/utils/encryption.py
import sys
import os

# Add the project root ('ne') to Python's sys.path so it can find the 'app' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from cryptography.fernet import Fernet
from app.config.settings import ENCRYPTION_KEY

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_data(plain_text):
    if plain_text is None:
        return None
    return fernet.encrypt(plain_text.encode()).decode()

def decrypt_data(cipher_text):
    if cipher_text is None:
        return None
    return fernet.decrypt(cipher_text.encode()).decode()
