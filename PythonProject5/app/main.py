import logging
from fastapi import FastAPI
from app.core.config import settings
from app.whatsapp.routes import router as whatsapp_router
from app.db import Base, engine
from app import models
from app.admin.routes import router as admin_router
from app.channelling_routes import router as channelling_router
from app.core.scheduler import scheduler
from app.channelling_db import engine_channelling, BaseChannelling
from app import channelling_models

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="HealixPharm - WhatsApp Bot")

from app.core.scheduler import scheduler
@app.on_event("startup")
async def startup_event():
    scheduler.start()

logger.info("[WB_MAIN] HealixPharm WhatsApp Bot initialized")
logger.info(f"[WB_MAIN] Server: {settings.SERVER_HOST}:{settings.SERVER_PORT}")
logger.info(f"[WB_MAIN] Debug Mode: {settings.DEBUG}")

# Include WhatsApp webhook routes
app.include_router(whatsapp_router)
logger.info("[WB_MAIN] WhatsApp routes included")

# Include admin routes for pharmacist actions (approve/reject)
app.include_router(admin_router)
logger.info("[WB_MAIN] Admin routes included")

# Include E-Channelling routes
app.include_router(channelling_router)
logger.info("[WB_MAIN] Channelling routes included")

Base.metadata.create_all(bind=engine)
logger.info("[WB_MAIN] Pharmacy database tables ensured")

# Ensure channelling tables exist
BaseChannelling.metadata.create_all(bind=engine_channelling)
logger.info("[WB_MAIN] Channelling database tables ensured")

@app.on_event("startup")
async def startup_event():
    logger.info("[WB_MAIN] Starting background scheduler...")
    scheduler.start()

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
