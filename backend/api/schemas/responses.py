"""
schemas/responses.py
────────────────────
Defines the EXACT shape of every JSON response.

Why this exists:
- React team knows exactly what JSON to expect
- FastAPI auto-validates every response
- Auto-generates API docs with examples
- Type errors caught at runtime not in the browser
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════════════

class HealthResponse(BaseModel):
    """GET /health"""
    status: str = Field(..., example="healthy")
    api_version: str = Field(..., example="1.0.0")
    timestamp: str = Field(..., example="2026-03-20T10:30:00")


# ══════════════════════════════════════════════════════════════════════════════
# ERROR
# ══════════════════════════════════════════════════════════════════════════════

class ErrorResponse(BaseModel):
    """Returned when something goes wrong"""
    status: str = Field(default="error")
    message: str = Field(..., example="Run /predict/run first.")
    detail: Optional[str] = Field(None, example="FileNotFoundError: budgets.csv")


# ══════════════════════════════════════════════════════════════════════════════
# RUN PREDICTION
# ══════════════════════════════════════════════════════════════════════════════

class RunPredictionResponse(BaseModel):
    """POST /api/v1/predict/run"""
    status: str = Field(..., example="success")
    message: str = Field(..., example="Prediction pipeline completed successfully")
    target_month: str = Field(..., example="April 2026")
    items_predicted: int = Field(..., example=5024)
    total_budget: float = Field(..., example=40935807.31)
    time_taken_seconds: float = Field(..., example=47.3)
    timestamp: str = Field(..., example="2026-03-20T10:30:00")


# ══════════════════════════════════════════════════════════════════════════════
# BUDGETS
# ══════════════════════════════════════════════════════════════════════════════

class CategoryBudget(BaseModel):
    """Single row in the budget list"""
    category: str = Field(..., example="Cardiovascular")
    budget_required: float = Field(..., example=12500000.50)


class BudgetsResponse(BaseModel):
    """GET /api/v1/predict/budgets"""
    target_month: str = Field(..., example="April 2026")
    total_budget: float = Field(..., example=40935807.31)
    categories: List[CategoryBudget]
    count: int = Field(..., example=8)


# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY
# ══════════════════════════════════════════════════════════════════════════════

class InventoryItem(BaseModel):
    """Single item in the inventory plan"""
    item: str = Field(..., example="ATORVA 10MG 100S")
    category: str = Field(..., example="Cardiovascular")
    predicted_qty: int = Field(..., example=2847,
                               description="ML predicted quantity")
    recommended_stock: int = Field(..., example=3417,
                                   description="predicted_qty x 1.20 safety buffer")
    price: float = Field(..., example=37.20,
                         description="Latest unit price in LKR")
    budget_required: float = Field(..., example=127112.40,
                                   description="recommended_stock x price")


class InventoryResponse(BaseModel):
    """GET /api/v1/predict/inventory"""
    target_month: str = Field(..., example="April 2026")
    total_items: int = Field(..., example=5024)
    limit: int = Field(..., example=100)
    offset: int = Field(..., example=0)
    items: List[InventoryItem]


# ══════════════════════════════════════════════════════════════════════════════
# MODEL EVALUATION
# ══════════════════════════════════════════════════════════════════════════════

class EvaluationResponse(BaseModel):
    """GET /api/v1/predict/evaluation"""
    mae: float = Field(..., example=37.23,
                       description="Mean Absolute Error - avg units off per item")
    rmse: float = Field(..., example=196.82,
                        description="Root Mean Squared Error")
    r2_score: float = Field(..., example=0.6369,
                            description="R² Score - 1.0 is perfect")
    mape: float = Field(..., example=120.80,
                        description="Mean Absolute Percentage Error")
    verdict: str = Field(..., example="Acceptable",
                         description="Excellent / Good / Acceptable / Needs Improvement")
    interpretation: str = Field(..., example="Model explains 63.7% of sales variation")


# ══════════════════════════════════════════════════════════════════════════════
# TRENDS
# ══════════════════════════════════════════════════════════════════════════════

class TrendDataPoint(BaseModel):
    """Single data point in the trends chart"""
    month: int = Field(..., example=4,
                       description="Month number 1-12")
    month_name: str = Field(..., example="April",
                            description="Month name for display on chart")
    category: str = Field(..., example="Cardiovascular")
    total_qty: float = Field(..., example=28450.0,
                             description="Total quantity sold that month")


class TrendsResponse(BaseModel):
    """GET /api/v1/predict/trends"""
    date_range: str = Field(..., example="Apr 2025 - Mar 2026")
    categories: List[str] = Field(..., example=["Cardiovascular", "Anti-Diabetic"])
    data: List[TrendDataPoint]


# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD SUMMARY
# ══════════════════════════════════════════════════════════════════════════════

class DashboardSummary(BaseModel):
    """GET /api/v1/predict/summary — all key numbers in one request"""
    target_month: str = Field(..., example="April 2026")
    total_budget: float = Field(..., example=40935807.31)
    total_items: int = Field(..., example=5024)
    top_category: str = Field(..., example="Cardiovascular")
    top_category_budget: float = Field(..., example=12500000.50)
    model_r2: float = Field(..., example=0.6369)
    model_verdict: str = Field(..., example="Acceptable")
    last_run: Optional[str] = Field(None, example="2026-03-20T10:30:00")
    data_date_range: str = Field(..., example="Apr 2025 - Mar 2026")
    
    model_config = {"protected_namespaces": ()}