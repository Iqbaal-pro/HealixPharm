"""
HealixPharm Stock Management – FastAPI Application Entry Point.
Registers all routers and starts the background refill scheduler.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine
from app.database.base import Base
from app.models.user import User  # noqa: F401
from app.models.pharmacy import Pharmacy  # noqa: F401

# ─── Import all routers ─────────────────────────────────────────────
from app.routes.inventory_routes import router as inventory_router
from app.routes.prescription_routes import router as prescription_router
from app.routes.patient_routes import router as patient_router
from app.routes.reminder_routes import router as reminder_router
from app.routes.stock_adjustment_routes import router as stock_adjustment_router
from app.routes.batch_routes import router as batch_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.auth_routes import router as auth_router
from app.routes.pharmacy_routes import router as pharmacy_router
from app.routes.alert_routes import router as alert_router
from app.routes.refill_routes import router as refill_router

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
    # Startup — single DB for everything
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

# ─── CORS Middleware ───────────────────────────────────────────────
# Allow all origins for now (can be restricted to Vercel URL later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific Vercel URL if desired
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── Register all routers ──────────────────────────────────────────
app.include_router(inventory_router)
app.include_router(prescription_router)
app.include_router(patient_router)
app.include_router(reminder_router)
app.include_router(stock_adjustment_router)
app.include_router(batch_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(pharmacy_router)
app.include_router(alert_router)
app.include_router(refill_router)


# ─── Custom OpenAPI for Swagger BearerAuth ──────────────────────────
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Define Security Scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    # Apply security globally or to specific paths if needed
    # Here we just define the scheme so the Authorize button appears
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


@app.get("/")
def root():
    return {
        "service": "HealixPharm Stock Management",
        "version": "2.0.0",
        "endpoints": [
            "/inventory",
            "/prescriptions",
            "/patients",
            "/reminders",
            "/stock-adjustments",
            "/batches",
            "/analytics",
            "/auth",
            "/pharmacy",
            "/alerts",
            "/refill"
        ]
    }
