import logging
from datetime import datetime
from app.db import SessionLocal
from app.services import alert_service
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)
notif_service = NotificationService()

def run_alert_broadcast_job():
    """
    Orchestrator job for broadcasting MOH disease alerts.
    Runs every 30 minutes.
    """
    logger.info("[BROADCAST_JOB] Starting MOH Alert Broadcast Job")
    db = SessionLocal()
    today = datetime.now()
    lock_name = "moh_alert_broadcast_lock"
    lock_acquired = False
    
    try:
        # Acquire lock
        if not alert_service.acquire_job_lock(db, lock_name):
            logger.info("[BROADCAST_JOB] Could not acquire lock. Another instance might be running. Skipping.")
            return
        
        lock_acquired = True
        logger.info(f"[BROADCAST_JOB] Lock '{lock_name}' acquired.")

        # 1. Expire old alerts first
        alert_service.expire_old_alerts(db, today)
        
        # 2. Get eligible alerts (Active, High Threat, Not Sent, within date range)
        eligible_alerts = alert_service.get_eligible_alerts(db, today)
        if not eligible_alerts:
            logger.info("[BROADCAST_JOB] No eligible alerts found for broadcast.")
            return

        # 3. Get active patient numbers
        patient_numbers = alert_service.get_active_patient_numbers(db)
        if not patient_numbers:
            logger.info("[BROADCAST_JOB] No active patients found.")
            return

        for alert in eligible_alerts:
            logger.info(f"[BROADCAST_JOB] Processing alert: {alert.disease_name} (ID: {alert.id})")
            
            # Build message
            message_text = notif_service.build_alert_message(alert)
            
            success_count = 0
            fail_count = 0

            # Broadcast to all active patients
            for phone in patient_numbers:
                logger.debug(f"[BROADCAST_JOB] Sending to {phone}")
                result = notif_service.send_whatsapp_message(phone, message_text)
                
                is_success = result["success"]
                if is_success:
                    success_count += 1
                else:
                    fail_count += 1

                # Log broadcast status
                alert_service.save_broadcast_log(
                    db, 
                    alert_id=alert.id, 
                    phone=phone, 
                    status="SENT" if is_success else "FAILED",
                    response=str(result["response"])
                )
            
            # 5) Mark as sent only if good success rate (>= 90%)
            total = success_count + fail_count
            if total > 0 and (success_count / total) >= 0.90:
                alert_service.mark_broadcast_sent(db, alert.id)
                logger.info(f"[BROADCAST_JOB] Completed broadcast for alert ID: {alert.id} (Success Rate: {success_count/total:.2%})")
            else:
                alert_service.update_retry(db, alert.id)
                logger.warning(f"[BROADCAST_JOB] Success rate too low ({success_count/total if total > 0 else 0:.2%}). Alert ID {alert.id} will be retried.")
            
            db.commit() # Commit after each alert processing

    except Exception as e:
        logger.error(f"[BROADCAST_JOB] Error during broadcast job: {e}", exc_info=True)
    finally:
        if lock_acquired:
            alert_service.release_job_lock(db, lock_name)
            logger.info(f"[BROADCAST_JOB] Lock '{lock_name}' released.")
        db.close()
        logger.info("[BROADCAST_JOB] MOH Alert Broadcast Job finished")
