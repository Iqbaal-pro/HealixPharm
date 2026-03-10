from fastapi import APIRouter, Request, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.services.payhere_service import PayHereService
from app.services.notification_service import NotificationService
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments/payhere", tags=["payments"])

payhere_service = PayHereService()
notif_service = NotificationService()

@router.post("/notify")
async def payhere_notify(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Server-side notification (IPN) from PayHere.
    """
    # PayHere sends data as application/x-www-form-urlencoded
    form_data = await request.form()
    payload = dict(form_data)
    
    logger.info(f"[PAYMENTS] Received PayHere IPN for Order: {payload.get('order_id')} | Status: {payload.get('status_code')}")
    logger.debug(f"[PAYMENTS] Raw IPN Payload: {json.dumps(payload)}")

    # 1. Verify Signature
    if not payhere_service.verify_ipn_signature(payload):
        logger.error("[PAYMENTS] Invalid PayHere IPN Signature")
        # Log invalid attempt in payments table
        log_payment(db, payload, "INVALID_SIGNATURE")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 2. Process Based on Status Code
    order_token = payload.get("order_id")
    status_code = payload.get("status_code") # 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Charged Back
    payhere_amount = float(payload.get("payhere_amount", 0.0))
    payhere_reference = payload.get("payment_id")

    order = db.query(models.Order).filter(models.Order.token == order_token).first()
    if not order:
        logger.error(f"[PAYMENTS] Order {order_token} not found for IPN")
        return {"status": "error", "message": "Order not found"}

    if status_code == "2":
        # SUCCESS
        logger.info(f"[PAYMENTS] Payment Successful for Order {order.token}")
        
        # Verify amount matches (sanity check)
        if abs(order.total_amount - payhere_amount) > 0.01:
            logger.warning(f"[PAYMENTS] Amount mismatch! Order: {order.total_amount} | Paid: {payhere_amount}")
            # Potentially mark as UNDERPAID if significant, but for healthcare we should probably be strict
        
        # Update Order
        order.status = "PAID"
        order.payment_status = "PAID"
        order.payment_reference = payhere_reference
        order.paid_amount = payhere_amount
        order.paid_at = datetime.utcnow()
        
        log_payment(db, payload, "PAID")
        db.commit()

        # Notify user via WhatsApp
        try:
            msg = f"Payment Received! ✅\n\nYour order {order.token} is now being prepared for delivery. Thank you for choosing Healix Pharm."
            notif_service.twilio_wa.send_text(order.user.phone, msg)
        except Exception as e:
            logger.error(f"[PAYMENTS] Failed to send WhatsApp success notification: {e}")

    elif status_code in ["-1", "-2"]:
        # FAILED or CANCELED
        logger.warning(f"[PAYMENTS] Payment Failed/Canceled for Order {order.token} | Code: {status_code}")
        order.payment_status = "FAILED"
        log_payment(db, payload, "FAILED")
        db.commit()
    else:
        logger.info(f"[PAYMENTS] Payment status {status_code} for Order {order.token}")
        log_payment(db, payload, f"STATUS_{status_code}")
        db.commit()

    return {"status": "ok"}

def log_payment(db: Session, payload: dict, status: str):
    """Auxiliary to log payment attempt."""
    try:
        order_token = payload.get("order_id")
        order = db.query(models.Order).filter(models.Order.token == order_token).first()
        
        payment = models.Payment(
            order_id=order.id if order else 0,
            provider="PAYHERE",
            status=status,
            reference=payload.get("payment_id"),
            amount=float(payload.get("payhere_amount", 0.0)),
            ipn_payload=json.dumps(payload)
        )
        db.add(payment)
    except Exception as e:
        logger.error(f"[PAYMENTS] Failed to log payment: {e}")
