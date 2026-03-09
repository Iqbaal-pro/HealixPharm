import base64
import hashlib
import hmac
import json
import os
import time


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def _token_secret() -> bytes:
    return os.getenv("AUTH_SECRET_KEY", "change-this-secret").encode("utf-8")


def create_access_token(user_id: int, pharmacy_id: int, expires_in_seconds: int = 86400) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "pharmacy_id": pharmacy_id,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = _b64url_encode(payload_json)
    signature = hmac.new(_token_secret(), payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)
    return f"{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> dict:
    try:
        payload_b64, sig_b64 = token.split(".")
    except ValueError:
        raise ValueError("Invalid token format")

    expected_sig = hmac.new(_token_secret(), payload_b64.encode("ascii"), hashlib.sha256).digest()
    received_sig = _b64url_decode(sig_b64)
    if not hmac.compare_digest(expected_sig, received_sig):
        raise ValueError("Invalid token signature")

    payload_raw = _b64url_decode(payload_b64)
    try:
        payload = json.loads(payload_raw.decode("utf-8"))
    except json.JSONDecodeError:
        raise ValueError("Invalid token payload")

    exp = payload.get("exp")
    if not isinstance(exp, int) or int(time.time()) > exp:
        raise ValueError("Token expired")

    if "sub" not in payload or "pharmacy_id" not in payload:
        raise ValueError("Invalid token claims")

    return payload
