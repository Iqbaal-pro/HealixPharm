# ──────────────────────────────────────────────────────────────
# This file is no longer used.
# All DB connections now go through the main db.py using DB_* env vars.
# Kept for reference only — safe to delete.
# ──────────────────────────────────────────────────────────────

# Everything now uses the single Railway DB via app.database.db
# See: app/database/db.py → SessionLocal
# Models user.py and pharmacy.py now use app.database.base → Base
