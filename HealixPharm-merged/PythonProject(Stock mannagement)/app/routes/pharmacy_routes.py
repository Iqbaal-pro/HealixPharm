from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.user_db import UserSessionLocal
from app.routes.auth_routes import get_current_auth_context
from app.services.auth_service import AuthService

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])


class PharmacyUpdateRequest(BaseModel):
    pharmacy_name: str | None = None
    contact_number: str | None = None
    whatsapp_number: str | None = None
    address: str | None = None
    opening_hours: str | None = None
    estimated_delivery_time: str | None = None
    service_areas: str | None = None
    prescription_policy: str | None = None
    refund_policy: str | None = None


def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


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


@router.get("/me")
def get_my_pharmacy(context=Depends(get_current_auth_context)):
    return _serialize_pharmacy(context["pharmacy"])


@router.put("/me")
def update_my_pharmacy(
    payload: PharmacyUpdateRequest,
    context=Depends(get_current_auth_context),
    db: Session = Depends(get_user_db),
):
    service = AuthService(db)
    try:
        updated = service.update_pharmacy_by_user_id(
            user_id=context["user"].id,
            **payload.model_dump()
        )
        return {
            "message": "Pharmacy updated successfully",
            "pharmacy": _serialize_pharmacy(updated),
        }
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
