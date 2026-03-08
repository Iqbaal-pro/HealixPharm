# services/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler

# [Dose Reminders + Refill Reminders] — shared singleton scheduler instance.
# Dose reminders add date-triggered jobs via ReminderService.create_dose_reminder_from_stock().
# Refill reminders use the daily interval job registered in start_scheduler().
scheduler = BackgroundScheduler()


def start_scheduler():
    # [Refill Reminders] — register the daily refill check job and start the scheduler
    scheduler.add_job(check_refills, "interval", hours=24)
    scheduler.start()


def check_refills():
    # [Refill Reminders] — called by APScheduler every 24 hours to run the batch refill check
    from app.database.connection import SessionLocal
    from app.services.reminder_service import ReminderService
    db = SessionLocal()
    try:
        reminder_service = ReminderService(db)
        reminder_service.check_and_create_reminders()
    finally:
        db.close()
