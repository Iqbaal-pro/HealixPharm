from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.user_db import UserSessionLocal
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


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
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at
            },
            "pharmacy": {
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
        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at
            }
        }
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
