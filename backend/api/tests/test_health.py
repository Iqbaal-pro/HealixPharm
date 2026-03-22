"""
tests/test_health.py
────────────────────
Tests for the /health and / endpoints.

How to run:
    cd backend/api
    pytest tests/test_health.py -v

What -v does:
    Shows each test name and PASSED/FAILED
"""

import sys
import os

# Add the api/ folder to Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

# TestClient lets us call the API without running a real server
client = TestClient(app)


# ── Health endpoint tests ──────────────────────────────────────────────────────

def test_health_returns_200():
    """GET /health should return HTTP 200 OK"""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_status_is_healthy():
    """status field should be 'healthy'"""
    response = client.get("/health")
    data = response.json()
    assert data["status"] == "healthy"


def test_health_has_api_version():
    """api_version field should exist and equal 1.0.0"""
    response = client.get("/health")
    data = response.json()
    assert "api_version" in data
    assert data["api_version"] == "1.0.0"


def test_health_has_timestamp():
    """timestamp field should exist"""
    response = client.get("/health")
    data = response.json()
    assert "timestamp" in data
    assert data["timestamp"] is not None


def test_health_response_is_json():
    """Response should be valid JSON"""
    response = client.get("/health")
    assert response.headers["content-type"] == "application/json"


# ── Root endpoint tests ────────────────────────────────────────────────────────

def test_root_returns_200():
    """GET / should return HTTP 200 OK"""
    response = client.get("/")
    assert response.status_code == 200


def test_root_has_docs_link():
    """Root response should contain docs link"""
    response = client.get("/")
    data = response.json()
    assert "docs" in data


def test_root_has_message():
    """Root response should contain a message"""
    response = client.get("/")
    data = response.json()
    assert "message" in data


# ── Docs endpoint tests ────────────────────────────────────────────────────────

def test_swagger_docs_accessible():
    """Swagger UI at /docs should return 200"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_accessible():
    """OpenAPI JSON schema at /openapi.json should return 200"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
