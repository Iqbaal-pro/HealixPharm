"""
main.py  (FastAPI app — NOT the ML main.py)
───────────────────────────────────────────
This is the ENTRY POINT of the FastAPI server.

What it does:
1. Creates the FastAPI app
2. Sets up CORS (allows React to call this API)
3. Registers all routers (URL groups)
4. Adds health check endpoint
5. Starts the server

Run with:
    uvicorn main:app --reload --port 8000

Then visit:
    http://localhost:8000/docs        ← Interactive API docs (Swagger UI)
    http://localhost:8000/redoc       ← Alternative API docs
    http://localhost:8000/api/v1/...  ← Your actual endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from core.config import (
    ALLOWED_ORIGINS,
    API_TITLE,
    API_DESCRIPTION,
    API_VERSION,
    API_PREFIX,
)
from routers import predict


# ── Create FastAPI App ────────────────────────────────────────────────────────
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    # These customise the /docs page
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ── CORS Middleware ───────────────────────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing
# Without this, React (localhost:3000) CANNOT call this API (localhost:8000)
# Browser security blocks it. This middleware tells the browser "it's okay".
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,     # which URLs can call this API
    allow_credentials=True,            # allow cookies/auth headers
    allow_methods=["*"],               # allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],               # allow all headers
)


# ── Register Routers ──────────────────────────────────────────────────────────
# This connects all /predict/* endpoints to the app
# prefix="/api/v1" means final URL = /api/v1/predict/...
app.include_router(predict.router, prefix=API_PREFIX)


# ── Health Check ──────────────────────────────────────────────────────────────
# Simple endpoint to verify the server is running
# React team can poll this to check if API is up
@app.get(
    "/health",
    tags=["Health"],
    summary="Health Check",
    description="Returns 'healthy' if the API server is running."
)
async def health_check():
    return {
        "status": "healthy",
        "api_version": API_VERSION,
        "timestamp": datetime.now().isoformat(),
    }


# ── Root Endpoint ─────────────────────────────────────────────────────────────
@app.get(
    "/",
    tags=["Health"],
    summary="API Root",
    include_in_schema=False   # hide from docs
)
async def root():
    return {
        "message": "HealixPharm Stock Prediction API",
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
        "endpoints": f"{API_PREFIX}/predict/...",
    }


# ── Run directly (development only) ──────────────────────────────────────────
# For production use: uvicorn main:app --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,    # auto-restart when code changes
        log_level="info",
    )
