"""
schemas/responses.py
────────────────────
Defines the EXACT shape of every JSON response.
React team reads this to know what data to expect.

Every field has:
- Name        → key in the JSON
- Type        → what kind of data (string, number, list)
- Description → what it means
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ── Health Check ──────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    """Response for GET /health"""
    status: str = Field(..., example="healthy")
    api_version: str = Field(..., example="1.0.0")
    timestamp: str = Field(..., example="2026-03-20T10:30:00")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "api_version": "1.0.0",
                "timestamp": "2026-03-20T10:30:00"
            }
        }


# ── Run Prediction ─────────────────────────────────────────────────────────────
class RunPredictionResponse(BaseModel):
    """Response for POST /predict/run"""
    status: str = Field(..., example="success",
                        description="'success' or 'error'")
    message: str = Field(..., example="Prediction pipeline completed successfully")
    target_month: str = Field(..., example="April 2026",
                              description="Month being predicted")
    items_predicted: int = Field(..., example=5024,
                                 description="Total unique items predicted")
    total_budget: float = Field(..., example=40935807.31,
                                description="Total budget in LKR")
    time_taken_seconds: float = Field(..., example=47.3,
                                      description="How long the ML pipeline took")
    timestamp: str = Field(..., example="2026-03-20T10:30:00")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Prediction pipeline completed successfully",
                "target_month": "April 2026",
                "items_predicted": 5024,
                "total_budget": 40935807.31,
                "time_taken_seconds": 47.3,
                "timestamp": "2026-03-20T10:30:00"
            }
        }


# ── Category Budgets ───────────────────────────────────────────────────────────
class CategoryBudget(BaseModel):
    """Single category budget row"""
    category: str = Field(..., example="Cardiovascular",
                          description="Medicine category name")
    budget_required: float = Field(..., example=12500000.50,
                                   description="Total budget needed in LKR")

    class Config:
        json_schema_extra = {
            "example": {
                "category": "Cardiovascular",
                "budget_required": 12500000.50
            }
        }


class BudgetsResponse(BaseModel):
    """Response for GET /predict/budgets"""
    target_month: str = Field(..., example="April 2026")
    total_budget: float = Field(..., example=40935807.31)
    categories: List[CategoryBudget]
    count: int = Field(..., example=8, description="Number of categories")

    class Config:
        json_schema_extra = {
            "example": {
                "target_month": "April 2026",
                "total_budget": 40935807.31,
                "count": 8,
                "categories": [
                    {"category": "Cardiovascular",         "budget_required": 12500000.50},
                    {"category": "Anti-Diabetic",          "budget_required": 9800000.00},
                    {"category": "Vitamins & Supplements", "budget_required": 4200000.00},
                ]
            }
        }


# ── Inventory Plan ─────────────────────────────────────────────────────────────
class InventoryItem(BaseModel):
    """Single inventory item row"""
    item: str = Field(..., example="ATORVA 10MG 100S")
    category: str = Field(..., example="Cardiovascular")
    predicted_qty: int = Field(..., example=2847,
                               description="ML predicted quantity")
    recommended_stock: int = Field(..., example=3417,
                                   description="Predicted qty + 20% safety buffer")
    price: float = Field(..., example=37.20,
                         description="Latest unit price in LKR")
    budget_required: float = Field(..., example=127112.40,
                                   description="recommended_stock × price")

    class Config:
        json_schema_extra = {
            "example": {
                "item": "ATORVA 10MG 100S",
                "category": "Cardiovascular",
                "predicted_qty": 2847,
                "recommended_stock": 3417,
                "price": 37.20,
                "budget_required": 127112.40
            }
        }


class InventoryResponse(BaseModel):
    """Response for GET /predict/inventory"""
    target_month: str = Field(..., example="April 2026")
    total_items: int = Field(..., example=5024)
    items: List[InventoryItem]

    class Config:
        json_schema_extra = {
            "example": {
                "target_month": "April 2026",
                "total_items": 5024,
                "items": [
                    {
                        "item": "ATORVA 10MG 100S",
                        "category": "Cardiovascular",
                        "predicted_qty": 2847,
                        "recommended_stock": 3417,
                        "price": 37.20,
                        "budget_required": 127112.40
                    }
                ]
            }
        }


# ── Model Evaluation ───────────────────────────────────────────────────────────
class EvaluationResponse(BaseModel):
    """Response for GET /predict/evaluation"""
    mae: float = Field(..., example=37.23,
                       description="Mean Absolute Error — avg units off per item")
    rmse: float = Field(..., example=196.82,
                        description="Root Mean Squared Error")
    r2_score: float = Field(..., example=0.6369,
                            description="R² Score — 1.0 is perfect")
    mape: float = Field(..., example=120.80,
                        description="Mean Absolute Percentage Error")
    verdict: str = Field(..., example="Acceptable",
                         description="Excellent/Good/Acceptable/Needs Improvement")
    interpretation: str = Field(...,
                                example="Model explains 63.7% of sales variation")

    class Config:
        json_schema_extra = {
            "example": {
                "mae": 37.23,
                "rmse": 196.82,
                "r2_score": 0.6369,
                "mape": 120.80,
                "verdict": "Acceptable",
                "interpretation": "Model explains 63.7% of sales variation"
            }
        }


# ── Sales Trends ───────────────────────────────────────────────────────────────
class TrendDataPoint(BaseModel):
    """Single month-category data point"""
    month: int = Field(..., example=4, description="Month number 1-12")
    month_name: str = Field(..., example="April",
                            description="Month name for display")
    category: str = Field(..., example="Cardiovascular")
    total_qty: float = Field(..., example=28450.0,
                             description="Total quantity sold that month")

    class Config:
        json_schema_extra = {
            "example": {
                "month": 4,
                "month_name": "April",
                "category": "Cardiovascular",
                "total_qty": 28450.0
            }
        }


class TrendsResponse(BaseModel):
    """Response for GET /predict/trends"""
    date_range: str = Field(..., example="Apr 2025 - Mar 2026")
    categories: List[str] = Field(...,
                                  example=["Cardiovascular", "Anti-Diabetic"])
    data: List[TrendDataPoint]

    class Config:
        json_schema_extra = {
            "example": {
                "date_range": "Apr 2025 - Mar 2026",
                "categories": ["Cardiovascular", "Anti-Diabetic"],
                "data": [
                    {"month": 1, "month_name": "January",
                     "category": "Cardiovascular", "total_qty": 28450.0},
                    {"month": 1, "month_name": "January",
                     "category": "Anti-Diabetic",  "total_qty": 19200.0},
                ]
            }
        }


# ── Summary Dashboard ──────────────────────────────────────────────────────────
class DashboardSummary(BaseModel):
    """Response for GET /predict/summary — main dashboard numbers"""
    target_month: str = Field(..., example="April 2026")
    total_budget: float = Field(..., example=40935807.31)
    total_items: int = Field(..., example=5024)
    top_category: str = Field(..., example="Cardiovascular")
    top_category_budget: float = Field(..., example=12500000.50)
    model_r2: float = Field(..., example=0.6369)
    model_verdict: str = Field(..., example="Acceptable")
    last_run: Optional[str] = Field(None, example="2026-03-20T10:30:00")
    data_date_range: str = Field(..., example="Apr 2025 - Mar 2026")

    class Config:
        json_schema_extra = {
            "example": {
                "target_month": "April 2026",
                "total_budget": 40935807.31,
                "total_items": 5024,
                "top_category": "Cardiovascular",
                "top_category_budget": 12500000.50,
                "model_r2": 0.6369,
                "model_verdict": "Acceptable",
                "last_run": "2026-03-20T10:30:00",
                "data_date_range": "Apr 2025 - Mar 2026"
            }
        }


# ── Error Response ─────────────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    """Returned when something goes wrong"""
    status: str = Field(default="error")
    message: str = Field(..., example="Prediction files not found. Run /predict/run first.")
    detail: Optional[str] = Field(None, example="FileNotFoundError: budgets.csv")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "error",
                "message": "Prediction files not found. Run /predict/run first.",
                "detail": "FileNotFoundError: budgets.csv"
            }
        }
