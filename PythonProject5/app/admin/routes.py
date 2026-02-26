from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])
notif = NotificationService()


from datetime import datetime
from typing import Optional

class StatusUpdate(BaseModel):
    status: str


class AlertCreate(BaseModel):
    disease_name: str
    region: str
    threat_level: str
    start_date: datetime
    end_date: datetime


@router.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    """List orders for admin review."""
    orders = db.query(models.Order).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "token": o.token,
            "status": o.status,
            "user_phone": o.user.phone if o.user else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })
    return result


@router.post("/orders/{order_id}/status")
def update_order_status(order_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    """
    Admin endpoint to update order status. Allowed values: APPROVED, REJECTED.
    Sending rejection SMS via Twilio when status == REJECTED.
    """
    status = payload.status.strip().upper()
    if status not in ("APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.add(order)
    db.commit()
    db.refresh(order)

    if status == "REJECTED":
        try:
            user_phone = order.user.phone if order.user else None
            if user_phone:
                notif.send_rejection_sms(user_phone, order.token)
        except Exception as e:
            logger.error(f"Failed to send rejection SMS for order {order.id}: {e}")

    return {"id": order.id, "token": order.token, "status": order.status}


@router.post("/moh-alert/create")
def create_moh_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    """
    Build Admin API endpoint to create MOH alert.
    Validates threat_level and dates.
    """
    if not payload.disease_name.strip():
        raise HTTPException(status_code=400, detail="disease_name not empty")
    if not payload.region.strip():
        raise HTTPException(status_code=400, detail="region not empty")

    threat_level = payload.threat_level.strip().capitalize()
    if threat_level not in ("Low", "Medium", "High"):
        raise HTTPException(status_code=400, detail="threat_level must be Low, Medium, or High")

    if payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="start_date <= end_date")

    new_alert = models.MOHDiseaseAlert(
        disease_name=payload.disease_name,
        region=payload.region,
        threat_level=threat_level,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="Active",
        broadcast_sent=False,
        retry_count=0
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert
