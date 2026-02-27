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

# Include Routers
app.include_router(whatsapp_router)
app.include_router(admin_router)
app.include_router(payments_router)

# Ensure database tables exist
try:
    Base.metadata.create_all(bind=engine)
    logger.info("[WB_MAIN] Database tables ensured")
except Exception as e:
    logger.warning(f"[WB_MAIN] Database initialization warning (might already exist): {e}")

@app.on_event("startup")
async def startup_event():
    logger.info("[WB_MAIN] Starting background scheduler...")
    
    # Check if scheduler is already running (handle reloads)
    if not scheduler.running:
        scheduler.start()
        logger.info("[WB_MAIN] Scheduler started.")
    else:
        logger.info("[WB_MAIN] Scheduler is already running.")
    
    # Add fulfillment monitor job (Runs every 5 minutes)
    scheduler.add_job(monitor_fulfillment, 'interval', minutes=5, id='fulfillment_monitor', replace_existing=True)
    
    logger.info("[WB_MAIN] Background jobs scheduled.")

@app.get("/health")
async def health_check_wb():
    return {"status": "ok", "service": "HealixPharm WhatsApp Bot"}

@app.get("/")
async def root_wb():
    return {
        "service": "HealixPharm WhatsApp Bot",
        "version": "1.0.0",
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
