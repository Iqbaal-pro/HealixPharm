import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.whatsapp.routes import router as whatsapp_router
from app.db import Base, engine
from app import models
from app import channelling_models
from app.admin.routes import router as admin_router

# Payments router
from app.payments.routes import router as payments_router
# echannelling
from app.channelling_routes import router as channelling_router
from app.image_routes import router as image_router
from app.notification_routes import router as notification_router
from app.storage_routes import router as storage_router
from app.auth_routes import router as auth_router
# Scheduler
from app.core.scheduler import scheduler
from app.core.fulfillment_scheduler import monitor_fulfillment

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="HealixPharm - WhatsApp Bot")

# ─── CORS Middleware
# We must NOT use allow_origins=["*"] if allow_credentials=True
# We use settings.ALLOWED_ORIGINS which is a carefully curated list.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# Include Routers
app.include_router(whatsapp_router)
app.include_router(admin_router)
app.include_router(payments_router)
app.include_router(channelling_router)
app.include_router(image_router)
app.include_router(notification_router)
app.include_router(storage_router)
app.include_router(auth_router)



@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"GLOBAL ERROR: {exc}", exc_info=True)
    # We try to get the origin from the request to stay CORS-friendly
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
        headers={"Access-Control-Allow-Origin": origin} 
    )

@app.on_event("startup")
async def startup_event():
    logger.info(f"[WB_MAIN] Starting server with ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")
    
    # Ensure database tables exist during startup
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("[WB_MAIN] Pharmacy database tables ensured")
    except Exception as e:
        logger.error(f"[WB_MAIN] Database initialization FAILED: {e}", exc_info=True)
        # We don't raise here so uvicorn doesn't crash, allowing us to see error
        
    logger.info("[WB_MAIN] Starting background scheduler...")

    # Start scheduler if not already running
    if not scheduler.running:
        scheduler.start()
        logger.info("[WB_MAIN] Scheduler started.")
    else:
        logger.info("[WB_MAIN] Scheduler is already running.")

    # Add fulfillment monitor job (Runs every 5 minutes)
    scheduler.add_job(
        monitor_fulfillment,
        'interval',
        minutes=5,
        id='fulfillment_monitor',
        replace_existing=True
    )

    # 3. Add disease alert job (Runs every settings.ALERT_JOB_INTERVAL_DAYS)
    from app.services.broadcast_job import run_alert_broadcast_job
    scheduler.add_job(
        run_alert_broadcast_job,
        "interval",
        days=settings.ALERT_JOB_INTERVAL_DAYS,
        id="moh_alert_job",
        replace_existing=True
    )

    
    logger.info("[WB_MAIN] Background jobs scheduled (Fulfillment & Disease Alerts).")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("[WB_MAIN] Shutting down background scheduler...")
    if scheduler.running:
        scheduler.shutdown()
        logger.info("[WB_MAIN] Background scheduler shut down")


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