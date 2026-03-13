from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.whatsapp_auth_service import WhatsAppAuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/whatsapp/status")
def get_whatsapp_auth_status(phone_number: str, db: Session = Depends(get_db)):
    """Check if a WhatsApp user is authenticated and registered."""
    is_auth = WhatsAppAuthService.is_authenticated(db, phone_number)
    return {"phone_number": phone_number, "is_authenticated": is_auth}
