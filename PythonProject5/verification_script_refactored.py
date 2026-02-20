import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.path.abspath("."))

from app.db import SessionLocal, Base, engine
from app.db_channelling import SessionChannelling, BaseChannelling, engine_channelling
from app.models import User
from app.models_channelling import Appointment, Doctor
from app.services.echannelling_service import (
    is_slot_taken, 
    create_pending_appointment, 
    update_appointment_status,
    seed_doctors_if_empty
)
from app.services.payment_service import generate_payhere_hash, verify_notify_signature
from app.core.config import settings

def test_channelling_refactored_db():
    print("--- Testing Refactored E-Channelling Service ---")
    db_main = SessionLocal()
    db_chan = SessionChannelling()
    try:
        # 1. Create a dummy user in MAIN DB
        user = db_main.query(User).filter(User.phone == "REFACTORED_TEST").first()
        if not user:
            user = User(phone="REFACTORED_TEST", name="Refactored User")
            db_main.add(user)
            db_main.commit()
            db_main.refresh(user)
        
        # 2. Seed and get a doctor in CHANNELLING DB
        seed_doctors_if_empty(db_chan)
        doctor = db_chan.query(Doctor).first()
        print(f"Using Doctor: {doctor.name} (ID: {doctor.id})")
        
        # 3. Test create_pending_appointment in CHANNELLING DB
        order_id = "REF-ORDER-1"
        appoint_time = datetime(2026, 6, 20, 10, 0)
        appt = create_pending_appointment(
            db_chan, user.id, user.phone, doctor.id, doctor.name, doctor.specialty, appoint_time, doctor.fee, order_id
        )
        print(f"Created pending appointment in Channelling DB: {appt.payhere_order_id}")
        
        # 4. Test is_slot_taken (should be False because it's only pending)
        taken = is_slot_taken(db_chan, doctor.id, appoint_time)
        print(f"Is slot taken (PENDING)? {taken} (Expected: False)")
        
        # 5. Update to PAID
        update_appointment_status(db_chan, order_id, "PAID")
        print(f"Updated status to PAID")
        
        # 6. Test is_slot_taken (should be True now)
        taken = is_slot_taken(db_chan, doctor.id, appoint_time)
        print(f"Is slot taken (PAID)? {taken} (Expected: True)")
        
    finally:
        db_main.close()
        db_chan.close()

if __name__ == "__main__":
    # Ensure tables exist for both
    Base.metadata.create_all(bind=engine)
    BaseChannelling.metadata.create_all(bind=engine_channelling)
    
    test_channelling_refactored_db()
