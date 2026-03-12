import sys
import os
from datetime import datetime

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import Base, get_db
from app import models

# Use a separate test DB for this script
TEST_DB_PATH = "verify_admin_logic.db"
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

engine = create_engine(f"sqlite:///{TEST_DB_PATH}")
TestingSessionLocal = sessionmaker(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def run_verification():
    print("--- Starting Verification Script ---")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # 1. Setup Data
    print("[1] Setting up test user and order...")
    user = models.User(phone="whatsapp:+1234567890", name="Test User")
    db.add(user)
    db.commit()
    
    order = models.Order(token="T_VERIFY", status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    print(f"    - Order Created: ID={order_id}, Token={order.token}")

    # 2. Test List Orders
    print("[2] Testing GET /admin/orders...")
    response = client.get("/admin/orders")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    print("    - OK")

    # 3. Test Order Detail
    print("[3] Testing GET /admin/orders/{id}...")
    response = client.get(f"/admin/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["token"] == "T_VERIFY"
    print("    - OK")

    # 4. Test Approve Order (Itemization & Pricing)
    print("[4] Testing POST /admin/orders/{id}/approve...")
    with patch("app.admin.routes.stock_bridge") as mock_stock, \
         patch("app.admin.routes.notif") as mock_notif:
        
        mock_stock.get_medicine_details.return_value = {"id": 1, "name": "Med A", "selling_price": 50.0}
        mock_stock.reserve_stock.return_value = True
        
        payload = {"items": [{"medicine_id": 1, "quantity": 3}]}
        response = client.post(f"/admin/orders/{order_id}/approve", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_amount"] == 150.0
        assert data["status"] == "AWAITING_PAYMENT_SELECTION"
        print(f"    - OK: Total amount is {data['total_amount']}")

    # 5. Test Confirm Payment
    print("[5] Testing POST /admin/orders/{id}/confirm-payment...")
    with patch("app.admin.routes.notif") as mock_notif:
        # Move order to AWAITING_PAYMENT for test
        order.status = "AWAITING_PAYMENT"
        db.commit()
        
        response = client.post(f"/admin/orders/{order_id}/confirm-payment")
        assert response.status_code == 200
        assert response.json()["status"] == "PAID"
        print("    - OK")

    # 6. Test Reject Order (Stock Release)
    print("[6] Testing POST /admin/orders/{id}/status (REJECTED)...")
    order2 = models.Order(token="T_REJECT", status="PENDING_VERIFICATION", user_id=user.id)
    db.add(order2)
    db.commit()
    db.refresh(order2)
    
    # Add an item to test release
    item = models.OrderItem(order_id=order2.id, medicine_id=10, medicine_name="Med B", quantity=5, unit_price=10.0, subtotal=50.0)
    db.add(item)
    db.commit()

    with patch("app.admin.routes.stock_bridge") as mock_stock, \
         patch("app.admin.routes.notif") as mock_notif:
        
        response = client.post(f"/admin/orders/{order2.id}/status", json={"status": "REJECTED"})
        assert response.status_code == 200
        assert response.json()["status"] == "REJECTED"
        
        mock_stock.release_stock.assert_called_once_with(10, 5)
        print("    - OK: Stock release called")

    db.close()
    print("--- Verification Successful! ---")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Verification Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        try:
            if os.path.exists(TEST_DB_PATH):
                os.remove(TEST_DB_PATH)
        except Exception:
            pass
