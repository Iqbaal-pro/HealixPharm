# generate_key.py
from cryptography.fernet import Fernet

key = Fernet.generate_key()
print(key.decode())  # Save this string in your settings