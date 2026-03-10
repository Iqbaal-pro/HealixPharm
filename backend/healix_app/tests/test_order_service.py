"""
test_order_service.py
─────────────────────
Tests for app/services/order_service.py

Covers:
  ✅ get_or_create_user → creates new user if not found
  ✅ get_or_create_user → returns existing user (no duplicate)
  ✅ create_order_with_prescription → creates Order with PENDING_VERIFICATION
  ✅ create_order_with_prescription → creates Prescription linked to order
  ✅ create_order_with_prescription → order token is unique and uppercase hex
  ✅ create_order_with_prescription → prescription_id is a UUID hex string
  ✅ Two orders for same user → both created independently
"""
import pytest
from tests.conftest import TestingSessionLocal
from app.services.order_service import get_or_create_user, create_order_with_prescription
from app import models


@pytest.fixture()
def session():
    """Isolated DB session per test (rollback after)."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.db import Base

    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()


class TestGetOrCreateUser:

    def test_creates_new_user(self, session):
        """First call for a new phone number creates a user record."""
        user = get_or_create_user(session, phone="+94771234567")
        assert user.id is not None
        assert user.phone == "+94771234567"

    def test_returns_existing_user(self, session):
        """Second call with same number returns the same user (no duplicate)."""
        u1 = get_or_create_user(session, phone="+94779999999")
        u2 = get_or_create_user(session, phone="+94779999999")
        assert u1.id == u2.id
        count = session.query(models.User).filter_by(phone="+94779999999").count()
        assert count == 1

    def test_user_name_stored(self, session):
        """Name argument is persisted when provided."""
        user = get_or_create_user(session, phone="+94770000001", name="Kamal Perera")
        assert user.name == "Kamal Perera"


class TestCreateOrderWithPrescription:

    def test_order_created_with_pending_status(self, session):
        """Order status must default to PENDING_VERIFICATION."""
        user = get_or_create_user(session, phone="+94771111111")
        order, _ = create_order_with_prescription(session, user, "prescriptions/abc.jpg")
        assert order.status == "PENDING_VERIFICATION"

    def test_order_token_is_uppercase_hex(self, session):
        """Order token must be 10-char uppercase hex."""
        user = get_or_create_user(session, phone="+94772222222")
        order, _ = create_order_with_prescription(session, user, "prescriptions/def.jpg")
        assert len(order.token) == 10
        assert order.token == order.token.upper()
        int(order.token, 16)  # must be valid hex

    def test_prescription_linked_to_order(self, session):
        """Prescription.order_id must match the created order's id."""
        user = get_or_create_user(session, phone="+94773333333")
        order, prescription = create_order_with_prescription(
            session, user, "prescriptions/ghi.jpg", s3_url="https://fake-url.com"
        )
        assert prescription.order_id == order.id
        assert prescription.s3_key == "prescriptions/ghi.jpg"
        assert prescription.s3_url == "https://fake-url.com"

    def test_prescription_id_is_uuid_hex(self, session):
        """prescription_id must be a 32-char hex UUID."""
        user = get_or_create_user(session, phone="+94774444444")
        _, prescription = create_order_with_prescription(
            session, user, "prescriptions/jkl.jpg"
        )
        assert len(prescription.prescription_id) == 32
        int(prescription.prescription_id, 16)  # must be valid hex

    def test_two_orders_for_same_user_are_independent(self, session):
        """Two orders for the same user must have different tokens."""
        user = get_or_create_user(session, phone="+94775555555")
        order1, _ = create_order_with_prescription(session, user, "prescriptions/a.jpg")
        order2, _ = create_order_with_prescription(session, user, "prescriptions/b.jpg")
        assert order1.token != order2.token
        assert order1.id != order2.id

    def test_order_linked_to_user(self, session):
        """order.user_id must match the user's id."""
        user = get_or_create_user(session, phone="+94776666666")
        order, _ = create_order_with_prescription(session, user, "prescriptions/m.jpg")
        assert order.user_id == user.id
