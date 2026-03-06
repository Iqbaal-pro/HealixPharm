"""
HealixPharm Stock Management – FastAPI Application Entry Point.
Registers all routers and starts the background refill scheduler.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database.db import engine
from app.database.base import Base

# ─── Import all routers ─────────────────────────────────────────────
from app.routes.inventory_routes import router as inventory_router
from app.routes.prescription_routes import router as prescription_router
from app.routes.patient_routes import router as patient_router
from app.routes.reminder_routes import router as reminder_router

# ─── Import scheduler ──────────────────────────────────────────────
from app.services.scheduler_service import start_scheduler, stop_scheduler

# ─── Configure logging ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s"
)


# ─── Lifespan: start/stop scheduler with the app ───────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the refill scheduler on startup, stop on shutdown."""
    # Startup
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


# ─── Create the FastAPI application ─────────────────────────────────
app = FastAPI(
    title="HealixPharm Stock Management",
    description="Stock management with patient reminders and refill tracking",
    version="2.0.0",
    lifespan=lifespan
)

# ─── Register all routers ──────────────────────────────────────────
app.include_router(inventory_router)
app.include_router(prescription_router)
app.include_router(patient_router)
app.include_router(reminder_router)


@app.get("/")
def root():
    return {
        "service": "HealixPharm Stock Management",
        "version": "2.0.0",
        "endpoints": [
            "/inventory",
            "/prescriptions",
            "/patients",
            "/reminders"
        ]
    }
