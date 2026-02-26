import logging
from fastapi import FastAPI
from app.core.config import settings
from app.whatsapp.routes import router as whatsapp_router
from app.db import Base, engine
from app import models
from app.admin.routes import router as admin_router
from app.payments.routes import router as payments_router
from app.core.scheduler import scheduler
from app.core.fulfillment_scheduler import monitor_fulfillment

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="HealixPharm - WhatsApp Bot")

logger.info("[WB_MAIN] HealixPharm WhatsApp Bot initialized")
logger.info(f"[WB_MAIN] Server: {settings.SERVER_HOST}:{settings.SERVER_PORT}")
logger.info(f"[WB_MAIN] Debug Mode: {settings.DEBUG}")

# Include WhatsApp webhook routes
app.include_router(whatsapp_router)
logger.info("[WB_MAIN] WhatsApp routes included")

# Include admin routes for pharmacist actions (approve/reject)
app.include_router(admin_router)
# Include payment routes
app.include_router(payments_router)
logger.info("[WB_MAIN] Payments routes included")

# Ensure database tables exist (creates if not present)
Base.metadata.create_all(bind=engine)
logger.info("[WB_MAIN] Database tables ensured")

<<<<<<< HEAD
# --- APScheduler Setup (Module 5) ---
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.broadcast_job import run_alert_broadcast_job

scheduler = BackgroundScheduler()

@app.on_event("startup")
def startup_event():
    logger.info("[WB_MAIN] Starting APScheduler...")
    # Add job to run every interval defined in settings (days)
    scheduler.add_job(
        run_alert_broadcast_job,
        "interval",
        days=settings.ALERT_JOB_INTERVAL_DAYS,
        id="moh_alert_job",
        replace_existing=True
    )
    # Also run once immediately on startup for verification/initial check
    scheduler.add_job(run_alert_broadcast_job, id="moh_alert_initial_run")
    
    scheduler.start()
    logger.info("[WB_MAIN] APScheduler started and moh_alert_job added")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("[WB_MAIN] Shutting down APScheduler...")
    scheduler.shutdown()
    logger.info("[WB_MAIN] APScheduler shut down")
=======
@app.on_event("startup")
async def startup_event():
    logger.info("[WB_MAIN] Starting background scheduler...")
    
    # 1. Start scheduler
    scheduler.start()
    
    # 2. Add fulfillment monitor job (Runs every 5 minutes)
    scheduler.add_job(monitor_fulfillment, 'interval', minutes=5, id='fulfillment_monitor', replace_existing=True)
    
    logger.info("[WB_MAIN] Background jobs scheduled.")
>>>>>>> 23b9adec51205709f8649d3560a32b2295743198

@app.get("/health")
async def health_check_wb():
    """
    Health check endpoint
    """
    logger.debug("[WB_HEALTH] Health check requested")
    return {"status": "ok", "service": "HealixPharm WhatsApp Bot"}

@app.get("/")
async def root_wb():
    """
    Root endpoint with API info
    """
    logger.debug("[WB_API] Root endpoint accessed")
    return {
        "service": "HealixPharm WhatsApp Bot",
        "version": "1.0.0",
        "phase": "PHASE 1 - Base (Webhook, Menu, Navigation)",
        "webhook": "/whatsapp",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("[WB_STARTUP] Starting WhatsApp Bot server...")
    uvicorn.run(
        app,
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )
