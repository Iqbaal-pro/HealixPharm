import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock, patch

from app.main import app
from app.db import Base, get_db
from app import models

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_admin_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create a test user
    user = models.User(phone="whatsapp:+1234567890", name="Test User")
    db.add(user)
    db.commit()
    db.close()
    yield

def test_list_orders():
    # Create some test orders
    db = TestingSessionLocal()
    user = db.query(models.User).first()
    order1 = models.Order(token="T1", status="PENDING_VERIFICATION", user_id=user.id)
    order2 = models.Order(token="T2", status="AWAITING_PAYMENT_SELECTION", user_id=user.id)
    db.add_all([order1, order2])
    db.commit()
    db.close()

    response = client.get("/admin/orders")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["token"] in ["T1", "T2"]

    # Test filtering
    response = client.get("/admin/orders?status=PENDING_VERIFICATION")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["status"] == "PENDING_VERIFICATION"

def test_get_order_details():
    db = TestingSessionLocal()
    user = db.query(models.User).first()
    order = models.Order(token="T_DETAIL", status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()

    response = client.get(f"/admin/orders/{order_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["token"] == "T_DETAIL"
    assert "items" in data

@patch("app.admin.routes.stock_bridge")
@patch("app.admin.routes.notif")
def test_approve_order(mock_notif, mock_stock_bridge):
    db = TestingSessionLocal()
    user = db.query(models.User).first()
    order = models.Order(token="T_APPROVE", status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()

    # Mock stock responses
    mock_stock_bridge.get_medicine_details.return_value = {
        "id": 10, "name": "Panadol", "selling_price": 5.50
    }
    mock_stock_bridge.reserve_stock.return_value = True

    payload = {
        "items": [
            {"medicine_id": 10, "quantity": 2}
        ]
    }

    response = client.post(f"/admin/orders/{order_id}/approve", json=payload)
    assert response.status_code == 200
    assert response.json()["total_amount"] == 11.0
    assert response.json()["status"] == "AWAITING_PAYMENT_SELECTION"

    # Verify DB update
    db = TestingSessionLocal()
    updated_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    assert updated_order.total_amount == 11.0
    assert len(updated_order.items) == 1
    assert updated_order.items[0].medicine_name == "Panadol"
    db.close()

@patch("app.admin.routes.stock_bridge")
@patch("app.admin.routes.notif")
def test_reject_order(mock_notif, mock_stock_bridge):
    db = TestingSessionLocal()
    user = db.query(models.User).first()
    order = models.Order(token="T_REJECT", status="PENDING_VERIFICATION", user_id=user.id)
    item = models.OrderItem(order_id=order.id, medicine_id=10, medicine_name="M1", quantity=1, unit_price=10.0, subtotal=10.0)
    db.add(order)
    db.commit()
    order.items.append(item)
    db.commit()
    order_id = order.id
    db.close()

    response = client.post(f"/admin/orders/{order_id}/status", json={"status": "REJECTED"})
    assert response.status_code == 200
    assert response.json()["status"] == "REJECTED"

    # Verify stock release called
    mock_stock_bridge.release_stock.assert_called_once_with(10, 1)
    # Verify notification called
    mock_notif.send_rejection_sms.assert_called_once()

@patch("app.admin.routes.notif")
def test_confirm_payment(mock_notif):
    db = TestingSessionLocal()
    user = db.query(models.User).first()
    order = models.Order(token="T_PAY", status="AWAITING_PAYMENT", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()

    response = client.post(f"/admin/orders/{order_id}/confirm-payment")
    assert response.status_code == 200
    assert response.json()["status"] == "PAID"

    db = TestingSessionLocal()
    updated_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    assert updated_order.status == "PAID"
    db.close()
