import uuid
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)


def get_or_create_user(db: Session, phone: str, name: str = None) -> models.User:
    """
    Get a user by phone or create if not exists.
    """
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if user:
        logger.info(f"[ORDER_SERVICE] Found existing user for phone {phone}")
        return user

    user = models.User(phone=phone, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"[ORDER_SERVICE] Created new user id={user.id} phone={phone}")
    return user


def create_order_with_prescription(db: Session, user: models.User, image_s3_key: str, s3_url: str = None) -> (models.Order, models.Prescription):
    """
    Create an order and associated prescription record automatically.
    Returns (order, prescription)
    """
    # generate tokens
    order_token = uuid.uuid4().hex[:10].upper()
    prescription_id = uuid.uuid4().hex

    order = models.Order(token=order_token, status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)

    prescription = models.Prescription(
        prescription_id=prescription_id,
        order_id=order.id,
        s3_key=image_s3_key,
        s3_url=s3_url
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    logger.info(f"[ORDER_SERVICE] Created order id={order.id} token={order.token} prescription={prescription.prescription_id}")
    return order, prescription
