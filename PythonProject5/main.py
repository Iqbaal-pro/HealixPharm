# ============================================================
# HealixPharm - Entry Point
# Run with: uvicorn main:app --reload --port 8000
# This re-exports the real app from app/main.py
# ============================================================
from app.main import app  # noqa: F401  - re-export for uvicorn
