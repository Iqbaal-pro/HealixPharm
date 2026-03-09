import os
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# App imports - will use environment variables set in PowerShell
from app.main import app
from app.db import Base, get_db, engine as real_engine
from app import models
from app.services.order_service import get_or_create_user, create_order_with_prescription

# Setup session factory using the app's engine (which should be sqlite per env var)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=real_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=real_engine)
    yield

def test_prescription_queue_empty():
    db = TestingSessionLocal()
    db.query(models.Order).delete()
    db.commit()
    db.close()
    
    response = client.get("/admin/prescriptions/queue")
    assert response.status_code == 200
    assert response.json() == []

@patch("app.admin.routes.s3_service")
def test_prescription_queue_with_items_generates_fresh_url(mock_s3):
    db = TestingSessionLocal()
    db.query(models.Order).delete()
    user = get_or_create_user(db, phone="+94771234567")
    order, prescription = create_order_with_prescription(db, user, "test_s3_key", "http://old-expired-url.com")
    db.commit()
    order_token = order.token
    db.close()

    # Mock S3 to return a fresh URL
    mock_s3.generate_presigned_url.return_value = "http://freshly-generated-url.com"

    response = client.get("/admin/prescriptions/queue")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["token"] == order_token
    # Verify that the fresh URL was returned, not the one from the DB
    assert data[0]["prescription_url"] == "http://freshly-generated-url.com"
    # Verify s3_service was called with the correct key
    mock_s3.generate_presigned_url.assert_called_once_with("test_s3_key")

def test_prescription_queue_filters_status():
    db = TestingSessionLocal()
    db.query(models.Order).delete()
    user = get_or_create_user(db, phone="+94771234567")
    order, prescription = create_order_with_prescription(db, user, "test_key", "http://test-url.com")
    
    order.status = "APPROVED"
    db.commit()
    db.close()

    response = client.get("/admin/prescriptions/queue")
    assert response.status_code == 200
    assert response.json() == []
