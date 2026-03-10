import hashlib
import sys
import os
import json
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
from app.services.payhere_service import PayHereService

# Setup Test DB
TEST_DB_PATH = "verify_payhere.db"
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

def test_payhere_logic():
    print("--- Starting PayHere Verification ---")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    payhere = PayHereService()

    # Mock settings for predictable hashing
    payhere.merchant_id = "123456"
    payhere.merchant_secret = "secret123"
    
    # 1. Test Hash Generation
    print("[1] Testing Hash Generation...")
    order_id = "T_001"
    amount = 500.00
    # Expected: MD5(123456 + T_001 + 500.00 + LKR + MD5(secret123).upper()).upper()
    secret_hash = hashlib.md5("secret123".encode()).hexdigest().upper()
    expected_hash = hashlib.md5(f"123456T_001500.00LKR{secret_hash}".encode()).hexdigest().upper()
    
    generated_hash = payhere._generate_hash(order_id, amount)
    assert generated_hash == expected_hash
    print(f"    - Hash OK: {generated_hash}")

    # 2. Test URL Generation
    print("[2] Testing Checkout URL Generation...")
    url = payhere.generate_checkout_url(order_id, amount, {"first_name": "John"})
    assert "merchant_id=123456" in url
    assert "order_id=T_001" in url
    assert f"hash={expected_hash}" in url
    print("    - URL Generation OK")

    # 3. Test IPN Verification
    print("[3] Testing IPN Signature Verification...")
    status_code = "2"
    payhere_amount = "500.00"
    payhere_currency = "LKR"
    
    # MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UpperCase(md5(merchant_secret)))
    check_string = f"123456T_001{payhere_amount}{payhere_currency}{status_code}{secret_hash}"
    ipn_hash = hashlib.md5(check_string.encode()).hexdigest().upper()
    
    payload = {
        "merchant_id": "123456",
        "order_id": order_id,
        "payhere_amount": payhere_amount,
        "payhere_currency": payhere_currency,
        "status_code": status_code,
        "md5sig": ipn_hash,
        "payment_id": "PAY_999"
    }
    
    assert payhere.verify_ipn_signature(payload) is True
    print("    - IPN Signature Verification OK")

    # 4. Test Webhook Processing
    print("[4] Testing Webhook Endpoint...")
    # Setup order in DB
    user = models.User(phone="whatsapp:+94771234567", name="John Doe")
    db.add(user)
    db.commit()
    
    order = models.Order(
        token=order_id, 
        user_id=user.id, 
        status="AWAITING_PAYMENT", 
        total_amount=500.00
    )
    db.add(order)
    db.commit()
    
    with patch("app.payments.routes.payhere_service") as mock_ps, \
         patch("app.payments.routes.notif_service") as mock_ns:
        
        mock_ps.verify_ipn_signature.return_value = True
        
        # PayHere sends as form data
        response = client.post("/payments/payhere/notify", data=payload)
        assert response.status_code == 200
        
        # Verify Order Status
        db.refresh(order)
        assert order.status == "PAID"
        assert order.payment_status == "PAID"
        assert order.payment_reference == "PAY_999"
        print("    - Webhook Processing OK (Order status updated to PAID)")
        
        # Verify Payment Log
        payment = db.query(models.Payment).filter(models.Payment.order_id == order.id).first()
        assert payment is not None
        assert payment.status == "PAID"
        print("    - Payment Logging OK")

    db.close()
    print("--- PayHere Verification Successful! ---")

if __name__ == "__main__":
    try:
        test_payhere_logic()
    except Exception as e:
        print(f"Verification Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
