import sys
import os
import hashlib
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

def run_e2e_test():
    print("Starting End-to-End Verification for E-Channelling & PayHere\n")
    
    # Setup
    Base.metadata.create_all(bind=engine)
    BaseChannelling.metadata.create_all(bind=engine_channelling)
    
    db_main = SessionLocal()
    db_chan = SessionChannelling()
    
    try:
        # 1. Ensure Doctors exist
        seed_doctors_if_empty(db_chan)
        doctor = db_chan.query(Doctor).filter(Doctor.name == "Dr. Aris").first()
        print(f"Step 1: Doctor Found: {doctor.name} (Fee: {doctor.fee})")
        
        # 2. Mock User from WhatsApp
        phone = "94771234567"
        user = db_main.query(User).filter(User.phone == phone).first()
        if not user:
            user = User(phone=phone, name="Riyas")
            db_main.add(user)
            db_main.commit()
            db_main.refresh(user)
        print(f"Step 2: User Identified: {user.name} ({user.phone})")
        
        # 3. Initiate Booking (Pending Payment)
        order_id = f"APP-E2E-{datetime.now().strftime('%H%M%S')}"
        appt_time = datetime(2026, 7, 10, 14, 30)
        
        # Check availability first
        if is_slot_taken(db_chan, doctor.id, appt_time):
            print("Slot already taken!")
            return
            
        appt = create_pending_appointment(
            db_chan, user.id, user.phone, doctor.id, doctor.name, doctor.specialty, appt_time, doctor.fee, order_id
        )
        print(f"Step 3: Pending Appointment Created. Order ID: {appt.payhere_order_id}")
        print(f"   Status: {appt.status}")
        
        # 4. Mock PayHere Notification
        print("\nSimulating PayHere Payment Notification...")
        settings.PAYHERE_MERCHANT_ID = "12345"
        settings.PAYHERE_SECRET = "TEST_SECRET"
        
        amount_formatted = "{:.2f}".format(float(appt.fee))
        
        # Calculate signature as PayHere would
        secret_hash = hashlib.md5(settings.PAYHERE_SECRET.encode()).hexdigest().upper()
        # MD5(MerchantID + OrderID + PayAmount + PayCurrency + StatusCode + MD5(PayHereSecret))
        status_code = "2" # Success
        currency = "LKR"
        pre_hash = f"12345{order_id}{amount_formatted}{currency}{status_code}{secret_hash}"
        md5sig = hashlib.md5(pre_hash.encode()).hexdigest().upper()
        
        payload = {
            "merchant_id": "12345",
            "order_id": order_id,
            "pay_amount": amount_formatted,
            "pay_currency": currency,
            "status_code": status_code,
            "md5sig": md5sig
        }
        
        # Process notification
        if verify_notify_signature(payload):
            update_appointment_status(db_chan, order_id, "PAID")
            print("Step 4: PayHere Notification Verified & Processed.")
        else:
            print("Step 4: Signature Verification Failed!")
            return
            
        # 5. Verify Final State
        db_chan.refresh(appt)
        print(f"\nFinal Appointment Status: {appt.status}")
        if appt.status == "PAID":
            print("E2E VERIFICATION SUCCESSFUL!")
        else:
            print("Status Update Failed.")
            
        # 6. Verify Slot Locking works now
        taken = is_slot_taken(db_chan, doctor.id, appt_time)
        print(f"Slot Locking Check: Is slot taken now? {taken}")

    finally:
        db_main.close()
        db_chan.close()

if __name__ == "__main__":
    run_e2e_test()
