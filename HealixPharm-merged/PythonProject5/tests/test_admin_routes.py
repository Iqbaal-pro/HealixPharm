"""
test_admin_routes.py
─────────────────────
Tests for app/admin/routes.py

Covers:
  ✅ GET /admin/orders → lists all orders with correct fields
  ✅ POST /admin/orders/{id}/status → APPROVED → order status updated, no SMS
  ✅ POST /admin/orders/{id}/status → REJECTED → order status updated + SMS sent
  ✅ POST /admin/orders/{id}/status → invalid status → 400 error
  ✅ POST /admin/orders/{id}/status → unknown order id → 404 error
  ✅ Rejection SMS failure → order still marked REJECTED (best-effort SMS)
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import Base, get_db
from app import models
from app.services.order_service import get_or_create_user, create_order_with_prescription

# ─── Isolated in-memory DB for admin tests ─────────────────────────────────────
ADMIN_TEST_DB = "sqlite:///./admin_test.db"
admin_engine = create_engine(ADMIN_TEST_DB, connect_args={"check_same_thread": False})
AdminSession = sessionmaker(autocommit=False, autoflush=False, bind=admin_engine)

Base.metadata.create_all(bind=admin_engine)


def override_get_db():
    db = AdminSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ─── Helper: seed one order into the test DB ──────────────────────────────────
def seed_order(phone: str = "+94771234567", s3_key: str = "prescriptions/test.jpg"):
    db = AdminSession()
    user = get_or_create_user(db, phone=phone)
    order, prescription = create_order_with_prescription(db, user, s3_key)
    db.close()
    return order


class TestAdminListOrders:

    def test_list_orders_returns_list(self):
        """GET /admin/orders must return a list (even if empty)."""
        resp = client.get("/admin/orders")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_orders_has_expected_fields(self):
        """Each order in the list must have id, token, status, user_phone, created_at."""
        seed_order(phone="+94771110001")
        resp = client.get("/admin/orders")
        assert resp.status_code == 200
        orders = resp.json()
        assert len(orders) >= 1
        order = orders[-1]
        for field in ("id", "token", "status", "user_phone", "created_at"):
            assert field in order, f"Missing field: {field}"

    def test_new_order_status_is_pending(self):
        """A freshly seeded order must appear with PENDING_VERIFICATION status."""
        seed_order(phone="+94771110002")
        resp = client.get("/admin/orders")
        orders = resp.json()
        statuses = [o["status"] for o in orders]
        assert "PENDING_VERIFICATION" in statuses


class TestAdminApproveOrder:

    @patch("app.admin.routes.notif.send_rejection_sms")
    def test_approve_order_changes_status(self, mock_sms):
        """APPROVED update must set status to APPROVED and NOT send SMS."""
        order = seed_order(phone="+94771110003")
        resp = client.post(
            f"/admin/orders/{order.id}/status",
            json={"status": "APPROVED"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "APPROVED"
        mock_sms.assert_not_called()

    @patch("app.admin.routes.notif.send_rejection_sms")
    def test_reject_order_changes_status_and_sends_sms(self, mock_sms):
        """REJECTED update must set status to REJECTED AND call send_rejection_sms."""
        order = seed_order(phone="+94771110004")
        resp = client.post(
            f"/admin/orders/{order.id}/status",
            json={"status": "REJECTED"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "REJECTED"
        mock_sms.assert_called_once()
        # SMS must include the order token
        call_args = mock_sms.call_args
        assert order.token in str(call_args)

    def test_invalid_status_returns_400(self):
        """Sending an unsupported status value must return HTTP 400."""
        order = seed_order(phone="+94771110005")
        resp = client.post(
            f"/admin/orders/{order.id}/status",
            json={"status": "MAYBE"}
        )
        assert resp.status_code == 400
        assert "APPROVED" in resp.json()["detail"] or "REJECTED" in resp.json()["detail"]

    def test_unknown_order_id_returns_404(self):
        """Updating a non-existent order must return HTTP 404."""
        resp = client.post(
            "/admin/orders/999999/status",
            json={"status": "APPROVED"}
        )
        assert resp.status_code == 404

    @patch("app.admin.routes.notif.send_rejection_sms", side_effect=Exception("SMS gateway down"))
    def test_sms_failure_on_rejection_does_not_break_endpoint(self, mock_sms):
        """If SMS fails on rejection, the endpoint must still return the updated order."""
        order = seed_order(phone="+94771110006")
        resp = client.post(
            f"/admin/orders/{order.id}/status",
            json={"status": "REJECTED"}
        )
        # Endpoint should still succeed even if SMS sending raised
        assert resp.status_code == 200
        assert resp.json()["status"] == "REJECTED"
