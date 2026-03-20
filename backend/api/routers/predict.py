"""
routers/predict.py
──────────────────
All /predict/* endpoints live here.

What a ROUTER does:
- Defines the URL (e.g. /predict/budgets)
- Defines the HTTP method (GET, POST)
- Validates input parameters
- Calls the service layer
- Returns the response

It does NOT contain business logic — that's in ml_service.py
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional

from schemas.responses import (
    RunPredictionResponse,
    BudgetsResponse,
    InventoryResponse,
    EvaluationResponse,
    TrendsResponse,
    DashboardSummary,
    ErrorResponse,
)
from services import ml_service

# ── Create router ─────────────────────────────────────────────────────────────
# prefix="/predict" means all URLs in this file start with /predict
# tags=["Predictions"] groups them together in the API docs
router = APIRouter(
    prefix="/predict",
    tags=["Predictions"],
)


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 1 — Run ML Pipeline
# POST /api/v1/predict/run
# ══════════════════════════════════════════════════════════════════════════════
@router.post(
    "/run",
    response_model=RunPredictionResponse,
    summary="Run ML Prediction Pipeline",
    description="""
    Triggers the full ML prediction pipeline (main.py).

    ⚠️ This takes 40-60 seconds to complete.

    What it does:
    1. Loads and preprocesses pharmacy sales data
    2. Trains Random Forest model per item
    3. Predicts next month's stock requirements
    4. Calculates budget per category
    5. Saves all CSV reports and charts

    Call this FIRST before using other endpoints.
    React team: show a loading spinner while this runs.
    """,
    responses={
        200: {"description": "Pipeline ran successfully"},
        500: {"model": ErrorResponse, "description": "Pipeline failed"},
    }
)
async def run_prediction(background_tasks: BackgroundTasks):
    """
    POST /api/v1/predict/run

    Runs the complete ML pipeline.
    Returns status, total budget, and timing info.
    """
    try:
        result = ml_service.run_ml_pipeline()
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2 — Dashboard Summary
# GET /api/v1/predict/summary
# ══════════════════════════════════════════════════════════════════════════════
@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Dashboard Summary",
    description="""
    Returns all key numbers for the main dashboard in ONE request.

    React team: call this on dashboard page load.
    Use it to populate:
    - Total budget card
    - Items predicted card
    - Top category card
    - Model accuracy card
    - Last run timestamp
    """,
    responses={
        200: {"description": "Summary returned successfully"},
        404: {"model": ErrorResponse, "description": "No predictions found yet"},
    }
)
async def get_summary():
    """GET /api/v1/predict/summary"""
    try:
        return ml_service.get_summary()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3 — Category Budgets
# GET /api/v1/predict/budgets
# ══════════════════════════════════════════════════════════════════════════════
@router.get(
    "/budgets",
    response_model=BudgetsResponse,
    summary="Category Budget Breakdown",
    description="""
    Returns predicted budget required per medicine category.

    React team: use this for:
    - Pie chart (budget distribution)
    - Bar chart (budget per category)
    - Budget summary table
    """,
    responses={
        200: {"description": "Budgets returned"},
        404: {"model": ErrorResponse, "description": "Run /predict/run first"},
    }
)
async def get_budgets():
    """GET /api/v1/predict/budgets"""
    try:
        return ml_service.get_budgets()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 4 — Inventory Plan
# GET /api/v1/predict/inventory
# ══════════════════════════════════════════════════════════════════════════════
@router.get(
    "/inventory",
    response_model=InventoryResponse,
    summary="Detailed Inventory Plan",
    description="""
    Returns predicted stock requirements for every item.

    Supports:
    - **category**: filter by medicine category
    - **search**: search by item name (e.g. ATORVA)
    - **limit**: number of items per page (default 100)
    - **offset**: pagination offset (default 0)

    React team: use this for the inventory data table.
    Example: GET /predict/inventory?category=Cardiovascular&limit=50
    """,
    responses={
        200: {"description": "Inventory returned"},
        404: {"model": ErrorResponse, "description": "Run /predict/run first"},
    }
)
async def get_inventory(
    category: Optional[str] = Query(
        default=None,
        description="Filter by category e.g. 'Cardiovascular'",
        example="Cardiovascular"
    ),
    search: Optional[str] = Query(
        default=None,
        description="Search item name e.g. 'ATORVA'",
        example="ATORVA"
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=1000,
        description="Items per page (1-1000)"
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Pagination offset"
    ),
):
    """GET /api/v1/predict/inventory"""
    try:
        return ml_service.get_inventory(
            category=category,
            search=search,
            limit=limit,
            offset=offset,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 5 — Model Evaluation
# GET /api/v1/predict/evaluation
# ══════════════════════════════════════════════════════════════════════════════
@router.get(
    "/evaluation",
    response_model=EvaluationResponse,
    summary="ML Model Accuracy Metrics",
    description="""
    Returns accuracy metrics for the ML prediction model.

    Metrics explained:
    - **MAE**: Average prediction error in units
    - **RMSE**: Error score that penalizes large mistakes
    - **R² Score**: 1.0 = perfect, 0.64 = acceptable
    - **MAPE**: Average % error per item
    - **verdict**: Excellent / Good / Acceptable / Needs Improvement

    React team: use this for the model accuracy card/panel.
    """,
    responses={
        200: {"description": "Evaluation metrics returned"},
        404: {"model": ErrorResponse, "description": "Run /predict/run first"},
    }
)
async def get_evaluation():
    """GET /api/v1/predict/evaluation"""
    try:
        return ml_service.get_evaluation()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 6 — Sales Trends
# GET /api/v1/predict/trends
# ══════════════════════════════════════════════════════════════════════════════
@router.get(
    "/trends",
    response_model=TrendsResponse,
    summary="12-Month Sales Trends",
    description="""
    Returns monthly sales totals per category for the past 12 months.

    React team: use this for the line chart showing
    sales trends over time per medicine category.

    Each data point has: month number, month name, category, total qty.
    """,
    responses={
        200: {"description": "Trends returned"},
        404: {"model": ErrorResponse, "description": "Run /predict/run first"},
    }
)
async def get_trends():
    """GET /api/v1/predict/trends"""
    try:
        return ml_service.get_trends()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
