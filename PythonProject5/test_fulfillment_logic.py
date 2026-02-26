import os
import sys
import logging
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

# Ensure app directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Enable logging to file for debugging
log_file = "test_fulfillment.log"
if os.path.exists(log_file):
    os.remove(log_file)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("test_fulfillment")

from app.core import fulfillment_scheduler
from app import models
from app.db import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create in-memory engine for isolation
test_engine = create_engine("sqlite:///:memory:")
TestSessionLocal = sessionmaker(bind=test_engine)

# Mock dependencies
mock_twilio = MagicMock()
mock_stock = MagicMock()

def setup_test_db():
    logger.info("Initializing isolated in-memory test database...")
    try:
        Base.metadata.create_all(bind=test_engine)
        db = TestSessionLocal()
        return db
    except Exception as e:
        logger.error(f"DB Setup Error: {e}")
        raise

def test_fulfillment_scenarios():
    db = setup_test_db()
    
    # 1. Create a Test User
    user = models.User(phone="whatsapp:+1234567890", name="Test User")
    db.add(user)
    db.commit()

    # 2. Prepare Scenarios
    now = datetime.utcnow()
    
    # Scenario A: Just approved (No reminder needed)
    order_a = models.Order(token="TOKEN_NEW", user_id=user.id, status="AWAITING_PAYMENT_SELECTION", approved_at=now - timedelta(minutes=5), total_amount=150.0)
    
    # Scenario B: 20 mins ago (First reminder needed)
    order_b = models.Order(token="TOKEN_REM1", user_id=user.id, status="AWAITING_PAYMENT_SELECTION", approved_at=now - timedelta(minutes=20), reminder_count=0, total_amount=250.0)
    
    # Scenario C: 40 mins ago (Second reminder needed)
    order_c = models.Order(token="TOKEN_REM2", user_id=user.id, status="AWAITING_PAYMENT_SELECTION", approved_at=now - timedelta(minutes=40), reminder_count=1, total_amount=350.0)
    
    # Scenario D: 2.5 hours ago (Cancellation needed)
    order_d = models.Order(token="TOKEN_CANCEL", user_id=user.id, status="AWAITING_PAYMENT_SELECTION", approved_at=now - timedelta(hours=2.5), total_amount=450.0)
    
    db.add_all([order_a, order_b, order_c, order_d])
    db.commit()
    
    # Refresh to ensure IDs are populated
    db.refresh(order_a)
    db.refresh(order_b)
    db.refresh(order_c)
    db.refresh(order_d)

    # Create dummy items for Scenario D to test stock release
    item = models.OrderItem(order_id=order_d.id, medicine_id=99, medicine_name="Test Med", quantity=2, unit_price=10.0, subtotal=20.0)
    db.add(item)
    db.commit()

    logger.info("--- Running Fulfillment Monitor Test ---")
    
    with patch('app.core.fulfillment_scheduler.twilio_wa', mock_twilio), \
         patch('app.core.fulfillment_scheduler.stock_bridge', mock_stock):
        
        try:
            fulfillment_scheduler.monitor_fulfillment(db_session=db)
        except Exception as e:
            logger.error(f"Monitor execution failed: {e}", exc_info=True)

    # 3. Verify Results
    db.refresh(order_a)
    db.refresh(order_b)
    db.refresh(order_c)
    db.refresh(order_d)

    logger.info(f"Order A (5m): Status={order_a.status}, Reminders={order_a.reminder_count}")
    logger.info(f"Order B (20m): Status={order_b.status}, Reminders={order_b.reminder_count}")
    logger.info(f"Order C (40m): Status={order_c.status}, Reminders={order_c.reminder_count}")
    logger.info(f"Order D (2.5h): Status={order_d.status}")

    # Assertions
    try:
        assert order_a.reminder_count == 0
        assert order_b.reminder_count == 1
        assert order_c.reminder_count == 2
        assert order_d.status == "CANCELLED"
        logger.info("[OK] ALL TEST SCENARIOS PASSED!")
    except AssertionError as e:
        logger.info("[FAIL] ASSERTION FAILED")
        raise e

if __name__ == "__main__":
    try:
        test_fulfillment_scenarios()
    except Exception as e:
        sys.exit(1)
