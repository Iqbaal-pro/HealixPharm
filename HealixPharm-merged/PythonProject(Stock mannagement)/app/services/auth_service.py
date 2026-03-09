import binascii
import hashlib
import hmac
import os

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.pharmacy import Pharmacy


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _hash_password(password: str) -> str:
        iterations = 200000
        salt = os.urandom(16)
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            iterations
        )
        salt_hex = binascii.hexlify(salt).decode("ascii")
        digest_hex = binascii.hexlify(digest).decode("ascii")
        return f"pbkdf2_sha256${iterations}${salt_hex}${digest_hex}"

    @staticmethod
    def _verify_password(plain_password: str, stored_password: str) -> bool:
        # Backward compatibility for legacy plaintext rows
        if not stored_password.startswith("pbkdf2_sha256$"):
            return hmac.compare_digest(plain_password, stored_password)

        parts = stored_password.split("$")
        if len(parts) != 4:
            return False

        _, iterations_str, salt_hex, expected_hex = parts
        try:
            iterations = int(iterations_str)
            salt = binascii.unhexlify(salt_hex.encode("ascii"))
        except (ValueError, binascii.Error):
            return False

        calculated = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations
        )
        calculated_hex = binascii.hexlify(calculated).decode("ascii")
        return hmac.compare_digest(calculated_hex, expected_hex)

    def signup(
        self,
        username: str,
        email: str,
        password: str,
        pharmacy_name: str,
        contact_number: str = None,
        whatsapp_number: str = None,
        address: str = None,
        opening_hours: str = None,
        estimated_delivery_time: str = None,
        service_areas: str = None,
        prescription_policy: str = None,
        refund_policy: str = None,
    ):
        existing_user = self.db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing_user:
            raise ValueError("Username or email already exists")

        try:
            user = User(
                username=username,
                email=email,
                password=self._hash_password(password)
            )
            self.db.add(user)
            self.db.flush()

            pharmacy = Pharmacy(
                user_id=user.id,
                pharmacy_name=pharmacy_name,
                contact_number=contact_number,
                whatsapp_number=whatsapp_number,
                address=address,
                opening_hours=opening_hours,
                estimated_delivery_time=estimated_delivery_time,
                service_areas=service_areas,
                prescription_policy=prescription_policy,
                refund_policy=refund_policy,
            )
            self.db.add(pharmacy)
            self.db.commit()

            self.db.refresh(user)
            self.db.refresh(pharmacy)
            return user, pharmacy
        except Exception:
            self.db.rollback()
            raise

    def login(self, username_or_email: str, password: str) -> User:
        user = self.db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        if not user:
            raise ValueError("Invalid credentials")

        if not self._verify_password(password, user.password):
            raise ValueError("Invalid credentials")

        return user

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_pharmacy_by_user_id(self, user_id: int) -> Pharmacy | None:
        return self.db.query(Pharmacy).filter(Pharmacy.user_id == user_id).first()

    def update_pharmacy_by_user_id(self, user_id: int, **fields) -> Pharmacy:
        pharmacy = self.get_pharmacy_by_user_id(user_id)
        if not pharmacy:
            raise ValueError("Pharmacy profile not found")

        allowed = {
            "pharmacy_name",
            "contact_number",
            "whatsapp_number",
            "address",
            "opening_hours",
            "estimated_delivery_time",
            "service_areas",
            "prescription_policy",
            "refund_policy",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(pharmacy, key, value)

        self.db.add(pharmacy)
        self.db.commit()
        self.db.refresh(pharmacy)
        return pharmacy
