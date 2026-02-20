# services/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.reminder_service import ReminderService
from app.database.connection import SessionLocal

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_refills, "interval", hours=24)  # run daily
    scheduler.start()

def check_refills():
    db = SessionLocal()
    try:
        reminder_service = ReminderService(db)
        reminder_service.check_and_create_reminders()
    finally:
        db.close()
