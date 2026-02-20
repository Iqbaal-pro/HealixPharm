import logging
from fastapi import FastAPI
from app.core.config import settings
from app.whatsapp.routes import router as whatsapp_router
from app.db import Base, engine
from app import models
from app.admin.routes import router as admin_router
from app.api.channelling import router as channelling_router
from app.db_channelling import engine_channelling, BaseChannelling, SessionChannelling
from app.services.echannelling_service import seed_doctors_if_empty
import app.models_channelling

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
logger.info("[WB_MAIN] Admin routes included")

# Include E-Channelling routes
app.include_router(channelling_router)
logger.info("[WB_MAIN] E-Channelling routes included")

# Ensure database tables exist (creates if not present)
Base.metadata.create_all(bind=engine)
logger.info("[WB_MAIN] Main database tables ensured")

# Ensure Channelling database tables exist
BaseChannelling.metadata.create_all(bind=engine_channelling)
logger.info("[WB_MAIN] Channelling database tables ensured")

# Seed doctors if empty
with SessionChannelling() as db_chan:
    seed_doctors_if_empty(db_chan)
logger.info("[WB_MAIN] Doctors seeded (if empty)")

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
