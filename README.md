# HealixPharm

A modular pharmacy management platform with stock control, prescription handling, WhatsApp notifications, online payments, and patient reminders.

## Project Structure

```
HealixPharm/
├── backend/
│   ├── stock_management/   # Stock & inventory management API (FastAPI)
│   ├── healix_app/         # Main app: WhatsApp bot, payments, admin (FastAPI)
│   ├── healix_extra/       # Additional services & models
│   └── *.py                # Utility / simulation scripts
├── frontend/               # Frontend application (coming soon)
├── .env.example            # Environment variable template
├── requirements.txt        # Python dependencies
└── .gitignore
```

## Getting Started

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your real credentials
```

### 3. Run a backend service
```bash
# Stock Management API
cd backend/stock_management
uvicorn main:app --reload --port 8000

# Main HealixPharm App
cd backend/healix_app
uvicorn main:app --reload --port 8001
```

### 4. Databases
Each service uses MySQL. Create the required databases:
- `healix` – main application
- `stock_management_db` – stock/inventory
- `user_management` – user auth & pharmacy profiles

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| `stock_management` | 8000 | Inventory, batches, prescriptions, patient reminders, analytics |
| `healix_app` | 8001 | WhatsApp bot, online payments (PayHere), admin panel, e-channelling |
| `healix_extra` | — | Supplementary models and services |
