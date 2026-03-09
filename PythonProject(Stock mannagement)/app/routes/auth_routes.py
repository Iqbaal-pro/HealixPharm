from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.user_db import UserSessionLocal
from app.services.auth_service import AuthService
from app.services.auth_token_service import create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    pharmacy_name: str
    contact_number: str | None = None
    whatsapp_number: str | None = None
    address: str | None = None
    opening_hours: str | None = None
    estimated_delivery_time: str | None = None
    service_areas: str | None = None
    prescription_policy: str | None = None
    refund_policy: str | None = None


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at
    }


def _serialize_pharmacy(pharmacy):
    return {
        "id": pharmacy.id,
        "user_id": pharmacy.user_id,
        "pharmacy_name": pharmacy.pharmacy_name,
        "contact_number": pharmacy.contact_number,
        "whatsapp_number": pharmacy.whatsapp_number,
        "address": pharmacy.address,
        "opening_hours": pharmacy.opening_hours,
        "estimated_delivery_time": pharmacy.estimated_delivery_time,
        "service_areas": pharmacy.service_areas,
        "prescription_policy": pharmacy.prescription_policy,
        "refund_policy": pharmacy.refund_policy,
        "created_at": pharmacy.created_at,
    }


def get_current_auth_context(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_user_db),
):
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    service = AuthService(db)
    user = service.get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    pharmacy = service.get_pharmacy_by_user_id(user.id)
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy profile not found")

    return {"user": user, "pharmacy": pharmacy, "payload": payload}


@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_user_db)):
    service = AuthService(db)
    try:
        user, pharmacy = service.signup(
            username=payload.username,
            email=payload.email,
            password=payload.password,
            pharmacy_name=payload.pharmacy_name,
            contact_number=payload.contact_number,
            whatsapp_number=payload.whatsapp_number,
            address=payload.address,
            opening_hours=payload.opening_hours,
            estimated_delivery_time=payload.estimated_delivery_time,
            service_areas=payload.service_areas,
            prescription_policy=payload.prescription_policy,
            refund_policy=payload.refund_policy,
        )
        return {
            "message": "Signup successful",
            "user": _serialize_user(user),
            "pharmacy": _serialize_pharmacy(pharmacy),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_user_db)):
    service = AuthService(db)
    try:
        user = service.login(
            username_or_email=payload.username_or_email,
            password=payload.password
        )
        pharmacy = service.get_pharmacy_by_user_id(user.id)
        if not pharmacy:
            raise HTTPException(status_code=404, detail="Pharmacy profile not found")

        access_token = create_access_token(user_id=user.id, pharmacy_id=pharmacy.id)
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": _serialize_user(user),
            "pharmacy": _serialize_pharmacy(pharmacy),
        }
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))


@router.get("/me")
def auth_me(context=Depends(get_current_auth_context)):
    return {
        "user": _serialize_user(context["user"]),
        "pharmacy": _serialize_pharmacy(context["pharmacy"]),
        "token_claims": {
            "user_id": context["payload"]["sub"],
            "pharmacy_id": context["payload"]["pharmacy_id"],
            "exp": context["payload"]["exp"],
        }
    }
