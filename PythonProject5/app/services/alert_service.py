import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app import models
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_eligible_alerts(db: Session, today: datetime):
    """
    RETURN alerts WHERE:
        status = "Active"
        threat_level = "High"
        broadcast_sent = FALSE
        start_date <= today <= end_date
    """
    return db.query(models.MOHDiseaseAlert).filter(
        models.MOHDiseaseAlert.status == "Active",
        models.MOHDiseaseAlert.threat_level == settings.ALERT_MIN_THREAT_LEVEL,
        models.MOHDiseaseAlert.broadcast_sent == False,
        models.MOHDiseaseAlert.start_date <= today,
        models.MOHDiseaseAlert.end_date >= today
    ).all()

def expire_old_alerts(db: Session, today: datetime):
    """
    UPDATE alerts SET status="Expired"
    WHERE status="Active" AND end_date < today
    """
    expired_count = db.query(models.MOHDiseaseAlert).filter(
        models.MOHDiseaseAlert.status == "Active",
        models.MOHDiseaseAlert.end_date < today
    ).update({models.MOHDiseaseAlert.status: "Expired"}, synchronize_session=False)
    
    db.commit()
    logger.info(f"[ALERT_SERVICE] Expired {expired_count} old alerts.")
    return expired_count

def get_active_patient_numbers(db: Session):
    """
    RETURN phone_number FROM patients WHERE is_active=TRUE
    """
    patients = db.query(models.Patient).filter(models.Patient.is_active == True).all()
    return [p.phone_number for p in patients]

def mark_broadcast_sent(db: Session, alert_id: int):
    """
    UPDATE moh_disease_alerts SET broadcast_sent=TRUE WHERE id=alert_id
    """
    alert = db.query(models.MOHDiseaseAlert).filter(models.MOHDiseaseAlert.id == alert_id).first()
    if alert:
        alert.broadcast_sent = True
        db.commit()
        db.refresh(alert)
    return alert

def save_broadcast_log(db: Session, alert_id: int, phone: str, status: str, response: str):
    """
    INSERT INTO alert_broadcast_log (...)
    """
    log_entry = models.AlertBroadcastLog(
        alert_id=alert_id,
        phone_number=phone,
        send_status=status,
        api_response=response
    )
    db.add(log_entry)
    db.commit()
    return log_entry

def update_retry(db: Session, alert_id: int):
    """
    retry_count += 1
    last_attempt_at = now()
    """
    alert = db.query(models.MOHDiseaseAlert).filter(models.MOHDiseaseAlert.id == alert_id).first()
    if alert:
        alert.retry_count += 1
        alert.last_attempt_at = func.now()
        db.commit()
        db.refresh(alert)
    return alert
from sqlalchemy import text

def acquire_job_lock(db: Session, lock_name: str) -> bool:
    """
    FUNCTION AcquireJobLock(DB):
        TRY to acquire lock (MySQL GET_LOCK)
        RETURN true/false
    """
    try:
        # GET_LOCK(str, timeout)
        # timeout=0 means try to acquire and return immediately if not available
        result = db.execute(text("SELECT GET_LOCK(:name, 0)"), {"name": lock_name}).scalar()
        return result == 1
    except Exception as e:
        logger.error(f"[ALERT_SERVICE] Error acquiring lock {lock_name}: {e}")
        return False

def release_job_lock(db: Session, lock_name: str) -> bool:
    """
    FUNCTION ReleaseJobLock(DB):
        RELEASE MySQL lock
    """
    try:
        result = db.execute(text("SELECT RELEASE_LOCK(:name)"), {"name": lock_name}).scalar()
        return result == 1
    except Exception as e:
        logger.error(f"[ALERT_SERVICE] Error releasing lock {lock_name}: {e}")
        return False
