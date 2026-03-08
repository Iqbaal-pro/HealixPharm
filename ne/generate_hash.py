from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "admin123"

hashed_password = pwd_context.hash(password)

print("Hashed Password:")
print(hashed_password)