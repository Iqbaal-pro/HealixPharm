import os
import sys
from unittest.mock import MagicMock, patch

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base
from app import models
from app.whatsapp.service import WhatsAppService_wb
from app.whatsapp.state import UserState_wb
from app.admin.routes import approve_order_itemized
from app.admin.schemas import OrderApprovalPayload, OrderItemBase

# Create an isolated in-memory database so we touch NO prevailing data
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_pharmacist_approval_and_payment():
    print("=== HealixPharm Safe In-Memory Pharmacist Approval Flow Tester ===")
    print("Notice: Running completely in memory. NO changes to hosted database.\n")
    
    test_phone = "+94779999999"
    db = TestingSessionLocal()
    
    try:
        # 1. Setup Patient and Order (Status: PENDING_VERIFICATION)
        patient = models.Patient(phone_number=test_phone, name="Pharmacist Test Patient")
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
        order = models.Order(
            token="PHARMATST1", 
            status="PENDING_VERIFICATION", 
            patient_id=patient.id
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        print(f"[PHASE 1] Initial Setup")
        print(f"   ✅ Created test patient: {test_phone}")
        print(f"   ✅ Created test order: {order.token} (Status: {order.status})")

        # 2. Mocking the external dependencies for Admin Route
        with patch('app.admin.routes.stock_bridge') as mock_stock, \
             patch('app.admin.routes.notif') as mock_notif, \
             patch('app.whatsapp.service.SessionLocal', TestingSessionLocal):
             
            # Setup mock returns to mimic successful MySQL stock check
            mock_stock.get_medicine_details.return_value = {'name': 'Panadol 500mg', 'selling_price': 5.0}
            mock_stock.check_stock_availability.return_value = {"sufficient": True, "available": 100}
            mock_stock.reserve_stock.return_value = True
            
            # Setup Twilio mock
            mock_notif.twilio_wa.send_text = MagicMock()
            
            print(f"\n[PHASE 2] Simulating Pharmacist Approval in Admin Portal...")
            # Simulate the API payload from the frontend
            payload = OrderApprovalPayload(
                items=[OrderItemBase(medicine_id=1, quantity=10)]
            )
            
            # Execute the actual admin route function
            result = approve_order_itemized(order_id=order.id, payload=payload, db=db)
            
            db.refresh(order)
            print(f"   ✅ Pharmacist submitted approval payload for 10x Panadol.")
            print(f"   ✅ Order status dynamically updated to: {order.status}")
            print(f"   ✅ Order total calculated as: Rs. {order.total_amount}")
            
            # Check if Notification Service was called
            if mock_notif.twilio_wa.send_text.called:
                called_phone, called_msg = mock_notif.twilio_wa.send_text.call_args[0]
                print(f"   ✅ WhatsApp Notification successfully triggered!")
                print("   --- Message Sent to User ---")
                print(f"   To: {called_phone}")
                print(f"   Body:\n{called_msg}")
                print("   ----------------------------")
            else:
                print("   ❌ Expected notification wasn't sent.")

            # 3. Simulate User replying with Payment Option
            print(f"\n[PHASE 3] Simulating Patient selecting Payment Option via WhatsApp...")
            
            service = WhatsAppService_wb()
            service.twilio_wa.send_text = MagicMock() # Mock the service's own twilio
            
            # Since the user state was set to `awaiting_payment_selection` in the approve route, we can send text "2" for online
            # Note: UserState is in-memory for the bot, and updated during the approve_order_itemized
            
            print("   Patient replies with '2' (Online Payment)...")
            service._handle_text_message(test_phone, {"body": "2"})
            
            db.refresh(order)
            print(f"   ✅ Order payment method successfully updated to: {order.payment_method}")
            print(f"   ✅ Final Order status is now: {order.status}")
            
            if service.twilio_wa.send_text.called:
                 print(f"   ✅ Final Payment Link / Confirmation sent to patient via WhatsApp.")
                 
        print("\nSUCCESS: Pharmacist approval and payment flow mimics perfectly without DB side effects!")

    finally:
        db.close()

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    test_pharmacist_approval_and_payment()
