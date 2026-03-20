"""
tests/test_predict.py
─────────────────────
Tests for all /predict/* endpoints.

How to run:
    cd backend/api
    pytest tests/test_predict.py -v

Important:
    Some tests check for 200 OR 404.
    404 is expected BEFORE running the ML pipeline.
    200 is expected AFTER running the ML pipeline.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

def test_summary_returns_valid_status():
    """GET /summary returns 200 or 404 (404 if pipeline not run yet)"""
    response = client.get("/api/v1/predict/summary")
    assert response.status_code in [200, 404]


def test_summary_has_required_fields():
    """If data exists, summary must have all required fields"""
    response = client.get("/api/v1/predict/summary")
    if response.status_code == 200:
        data = response.json()
        assert "target_month" in data
        assert "total_budget" in data
        assert "total_items" in data
        assert "top_category" in data
        assert "model_r2" in data
        assert "model_verdict" in data


# ══════════════════════════════════════════════════════════════════════════════
# BUDGETS ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

def test_budgets_returns_valid_status():
    """GET /budgets returns 200 or 404"""
    response = client.get("/api/v1/predict/budgets")
    assert response.status_code in [200, 404]


def test_budgets_has_categories_list():
    """If data exists, response must have categories list"""
    response = client.get("/api/v1/predict/budgets")
    if response.status_code == 200:
        data = response.json()
        assert "categories" in data
        assert isinstance(data["categories"], list)


def test_budgets_category_has_required_fields():
    """Each category must have category name and budget_required"""
    response = client.get("/api/v1/predict/budgets")
    if response.status_code == 200:
        data = response.json()
        if data["categories"]:
            first = data["categories"][0]
            assert "category" in first
            assert "budget_required" in first


def test_budgets_total_matches_sum():
    """total_budget should equal sum of all category budgets"""
    response = client.get("/api/v1/predict/budgets")
    if response.status_code == 200:
        data = response.json()
        calculated = sum(c["budget_required"] for c in data["categories"])
        assert abs(data["total_budget"] - calculated) < 1.0  # allow 1 LKR rounding


# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

def test_inventory_returns_valid_status():
    """GET /inventory returns 200 or 404"""
    response = client.get("/api/v1/predict/inventory")
    assert response.status_code in [200, 404]


def test_inventory_default_limit_is_100():
    """Default response should have at most 100 items"""
    response = client.get("/api/v1/predict/inventory")
    if response.status_code == 200:
        data = response.json()
        assert len(data["items"]) <= 100


def test_inventory_limit_param_works():
    """limit=10 should return at most 10 items"""
    response = client.get("/api/v1/predict/inventory?limit=10")
    if response.status_code == 200:
        data = response.json()
        assert len(data["items"]) <= 10


def test_inventory_limit_too_large_rejected():
    """limit=9999 should be rejected (max is 1000)"""
    response = client.get("/api/v1/predict/inventory?limit=9999")
    assert response.status_code == 422   # 422 = validation error


def test_inventory_negative_offset_rejected():
    """offset=-1 should be rejected"""
    response = client.get("/api/v1/predict/inventory?offset=-1")
    assert response.status_code == 422


def test_inventory_category_filter_works():
    """All returned items should match the requested category"""
    response = client.get("/api/v1/predict/inventory?category=Cardiovascular")
    if response.status_code == 200:
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "Cardiovascular"


def test_inventory_search_filter_works():
    """All returned items should contain the search term"""
    response = client.get("/api/v1/predict/inventory?search=ATORVA")
    if response.status_code == 200:
        data = response.json()
        for item in data["items"]:
            assert "ATORVA" in item["item"].upper()


def test_inventory_item_has_required_fields():
    """Each item must have all 6 required fields"""
    response = client.get("/api/v1/predict/inventory?limit=1")
    if response.status_code == 200:
        data = response.json()
        if data["items"]:
            item = data["items"][0]
            assert "item" in item
            assert "category" in item
            assert "predicted_qty" in item
            assert "recommended_stock" in item
            assert "price" in item
            assert "budget_required" in item


def test_inventory_recommended_stock_greater_than_predicted():
    """recommended_stock should always be >= predicted_qty (20% buffer)"""
    response = client.get("/api/v1/predict/inventory?limit=50")
    if response.status_code == 200:
        data = response.json()
        for item in data["items"]:
            assert item["recommended_stock"] >= item["predicted_qty"]


# ══════════════════════════════════════════════════════════════════════════════
# EVALUATION ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

def test_evaluation_returns_valid_status():
    """GET /evaluation returns 200 or 404"""
    response = client.get("/api/v1/predict/evaluation")
    assert response.status_code in [200, 404]


def test_evaluation_has_all_metric_fields():
    """Response must have mae, rmse, r2_score, mape, verdict, interpretation"""
    response = client.get("/api/v1/predict/evaluation")
    if response.status_code == 200:
        data = response.json()
        assert "mae" in data
        assert "rmse" in data
        assert "r2_score" in data
        assert "mape" in data
        assert "verdict" in data
        assert "interpretation" in data


def test_evaluation_verdict_is_valid():
    """verdict must be one of the 4 known values"""
    response = client.get("/api/v1/predict/evaluation")
    if response.status_code == 200:
        data = response.json()
        valid_verdicts = ["Excellent", "Good", "Acceptable", "Needs Improvement"]
        assert data["verdict"] in valid_verdicts


def test_evaluation_r2_is_between_neg_and_one():
    """R² score should be a valid number"""
    response = client.get("/api/v1/predict/evaluation")
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data["r2_score"], float)
        assert data["r2_score"] <= 1.0   # cannot exceed 1.0


# ══════════════════════════════════════════════════════════════════════════════
# TRENDS ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

def test_trends_returns_valid_status():
    """GET /trends returns 200 or 404"""
    response = client.get("/api/v1/predict/trends")
    assert response.status_code in [200, 404]


def test_trends_has_required_fields():
    """Response must have date_range, categories, data"""
    response = client.get("/api/v1/predict/trends")
    if response.status_code == 200:
        data = response.json()
        assert "date_range" in data
        assert "categories" in data
        assert "data" in data


def test_trends_data_is_not_empty():
    """data array should have entries"""
    response = client.get("/api/v1/predict/trends")
    if response.status_code == 200:
        data = response.json()
        assert len(data["data"]) > 0


def test_trends_data_point_has_required_fields():
    """Each data point needs month, month_name, category, total_qty"""
    response = client.get("/api/v1/predict/trends")
    if response.status_code == 200:
        data = response.json()
        if data["data"]:
            point = data["data"][0]
            assert "month" in point
            assert "month_name" in point
            assert "category" in point
            assert "total_qty" in point


def test_trends_month_is_valid_number():
    """Month should be between 1 and 12"""
    response = client.get("/api/v1/predict/trends")
    if response.status_code == 200:
        data = response.json()
        for point in data["data"]:
            assert 1 <= point["month"] <= 12


def test_trends_excludes_unclassified():
    """Other Meds/Unclassified should not appear in trends"""
    response = client.get("/api/v1/predict/trends")
    if response.status_code == 200:
        data = response.json()
        for point in data["data"]:
            assert point["category"] != "Other Meds/Unclassified"
