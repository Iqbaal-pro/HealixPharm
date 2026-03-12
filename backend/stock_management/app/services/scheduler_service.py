"""
Scheduler Service – runs periodic refill checks using APScheduler.
Creates reminders for eligible prescriptions and processes them.
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler

from app.database.db import SessionLocal
from app.services.refill_service import get_eligible_prescriptions
from app.services.reminder_service import create_reminder, process_pending_reminders

logger = logging.getLogger(__name__)

# ─── Global scheduler instance ──────────────────────────────────────
scheduler = BackgroundScheduler()


def refill_check_job():
    """
    Scheduled job that runs daily/hourly:
      1. Opens a fresh DB session
      2. Finds prescriptions that need refill reminders
      3. Creates pending reminders for each
      4. Processes (sends) all pending reminders
      5. Closes the session

    One-time reminders: the status field ensures they are never re-sent
    because process_pending_reminders only picks status='pending'.
    """
    logger.info("🔄 Running scheduled refill check...")
    db = SessionLocal()

    try:
        # ── Step 1: Find eligible prescriptions ──────────────────
        eligible = get_eligible_prescriptions(db)
        logger.info(f"Found {len(eligible)} prescriptions needing refill")

        # ── Step 2: Create reminders (skip duplicates) ───────────
        from app.repositories.reminder_repo import ReminderRepository
        reminder_repo = ReminderRepository(db)

        for rx in eligible:
            # Check if there's already a pending reminder for this Rx
            existing = reminder_repo.get_by_prescription_id(rx.id)
            has_pending = any(r.status == "pending" for r in existing)

            if not has_pending:
                create_reminder(db, rx.id, one_time=False)
                logger.info(
                    f"Created refill reminder for prescription {rx.id} "
                    f"({rx.medicine_name})"
                )
            else:
                logger.info(
                    f"Skipping prescription {rx.id} – already has pending reminder"
                )

        # ── Step 3: Process (send) all pending reminders ─────────
        results = process_pending_reminders(db)
        for r in results:
            status = "✅" if r["success"] else "❌"
            logger.info(
                f"{status} Reminder {r['reminder_id']} → "
                f"{r['patient']} ({r['medicine']})"
            )

    except Exception as e:
        logger.error(f"Refill check job failed: {e}")

    finally:
        db.close()

    logger.info("✅ Refill check complete")


def start_scheduler():
    """
    Start the background scheduler with a daily refill check.
    Call this once at application startup.
    """
    # Run the refill check every 24 hours (can be changed to hourly)
    scheduler.add_job(
        refill_check_job,
        trigger="interval",
        hours=24,
        id="daily_refill_check",
        replace_existing=True
    )
    scheduler.start()
    logger.info("📅 Scheduler started – refill check runs every 24 hours")


def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
