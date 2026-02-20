# main.py
from fastapi import FastAPI
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.routes.reminder_routes import router as reminder_router
from app.services.reminder_service import ReminderService

app = FastAPI(title="Refill Reminder System")

# Include API routes
app.include_router(reminder_router)

# Function to run scheduled job
def scheduled_refill_job():
    # Get a new DB session
    db: Session = next(get_db())
    try:
        service = ReminderService(db)
        reminders_created = service.check_and_create_reminders()
        print(f"[{datetime.utcnow()}] Scheduled refill check complete. Reminders created: {reminders_created}")
    finally:
        db.close()

# Initialize APScheduler
scheduler = BackgroundScheduler()
# Schedule job: every day at 8 AM (adjust as needed)
scheduler.add_job(scheduled_refill_job, 'cron', hour=8, minute=0)
scheduler.start()

# Optional: Shutdown scheduler on app shutdown
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
