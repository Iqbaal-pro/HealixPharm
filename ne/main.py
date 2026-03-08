# main.py — Unified entry point for the merged HealixPharm reminder system
# Combines:
#   [Refill Reminders] — daily batch scheduler + /reminders/trigger-refills endpoint
#   [Dose Reminders]   — APScheduler date-jobs + /reminders/create-from-stock endpoint

from fastapi import FastAPI
from app.database.connection import engine
from app.database.declarative_base import Base
import app.models  # noqa: F401 — registers all models so create_all sees every table
from app.routes.reminder_routes import router as reminder_router
from app.services.scheduler import start_scheduler, scheduler

app = FastAPI(title="HealixPharm Reminder System")

# [Refill Reminders + Dose Reminders] — create all tables on startup
Base.metadata.create_all(bind=engine)

# [Refill Reminders + Dose Reminders] — mount the unified reminders router
app.include_router(reminder_router)

# [Refill Reminders] — start the APScheduler with the daily refill batch job
# [Dose Reminders]   — the same scheduler instance is used for date-triggered dose jobs
start_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    # [Refill Reminders + Dose Reminders] — gracefully shut down the shared APScheduler
    scheduler.shutdown()
