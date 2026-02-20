import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.path.abspath("."))

from app.db import SessionLocal, Base, engine
from app.models import Appointment, User
from app.services.echannelling_service import is_slot_taken, create_pending_appointment, update_appointment_status
from app.services.payment_service import generate_payhere_hash, verify_notify_signature
from app.core.config import settings

def test_channelling_logic():
    print("--- Testing E-Channelling Service ---")
    db = SessionLocal()
    try:
        # 1. Create a dummy user
        user = db.query(User).filter(User.phone == "TEST123").first()
        if not user:
            user = User(phone="TEST123", name="Test User")
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # 2. Test create_pending_appointment
        order_id = "TEST-ORDER-1"
        appoint_time = datetime(2026, 5, 20, 10, 0)
        appt = create_pending_appointment(
            db, user.id, "Dr. Aris", "Cardiology", appoint_time, "2500.00", order_id
        )
        print(f"Created pending appointment: {appt.payhere_order_id}")
        
        # 3. Test is_slot_taken (should be False because it's only pending)
        taken = is_slot_taken(db, "Dr. Aris", appoint_time)
        print(f"Is slot taken (PENDING)? {taken} (Expected: False)")
        
        # 4. Update to PAID
        update_appointment_status(db, order_id, "PAID")
        print(f"Updated status to PAID")
        
        # 5. Test is_slot_taken (should be True now)
        taken = is_slot_taken(db, "Dr. Aris", appoint_time)
        print(f"Is slot taken (PAID)? {taken} (Expected: True)")
        
    finally:
        db.close()

def test_payment_logic():
    print("\n--- Testing Payment Service ---")
    settings.PAYHERE_SECRET = "TESTSECRET"
    
    # 1. Test hash generation
    merchant_id = "M123"
    order_id = "O123"
    amount = "2500.00"
    currency = "LKR"
    
    gen_hash = generate_payhere_hash(merchant_id, order_id, amount, currency)
    print(f"Generated Hash: {gen_hash}")
    
    # 2. Test notification verification
    payload = {
        "merchant_id": merchant_id,
        "order_id": order_id,
        "pay_amount": amount,
        "pay_currency": currency,
        "status_code": "2",
        "md5sig": gen_hash # In notify payload, status_code is included in hash
    }
    
    # Re-calculate hash for notify signature check (which includes status_code)
    import hashlib
    secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
    pre_hash_string = f"{merchant_id}{order_id}{amount}{currency}2{secret_hash}"
    notify_sig = hashlib.md5(pre_hash_string.encode()).hexdigest().upper()
    payload["md5sig"] = notify_sig
    
    is_valid = verify_notify_signature(payload)
    print(f"Signature Valid? {is_valid} (Expected: True)")

if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    test_channelling_logic()
    test_payment_logic()
