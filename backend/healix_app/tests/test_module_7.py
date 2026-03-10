import sys
import os
from unittest.mock import MagicMock, patch

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services import alert_service
from app.services.broadcast_job import run_alert_broadcast_job

def test_module_7_lock_functions():
    print("\n--- Testing alert_service lock functions ---")
    
    with patch("sqlalchemy.orm.Session") as MockSession:
        mock_db = MockSession()
        lock_name = "test_lock"
        
        # 1. Test Acquire Success
        print("Step 1.1: Testing acquire_job_lock success...")
        mock_db.execute.return_value.scalar.return_value = 1
        assert alert_service.acquire_job_lock(mock_db, lock_name) is True
        print("Pass: Lock acquired")
        
        # 2. Test Acquire Failure (Lock already held)
        print("Step 1.2: Testing acquire_job_lock failure...")
        mock_db.execute.return_value.scalar.return_value = 0
        assert alert_service.acquire_job_lock(mock_db, lock_name) is False
        print("Pass: Lock skip detected correctly")
        
        # 3. Test Release Success
        print("Step 1.3: Testing release_job_lock success...")
        mock_db.execute.return_value.scalar.return_value = 1
        assert alert_service.release_job_lock(mock_db, lock_name) is True
        print("Pass: Lock released")

def test_module_7_job_integration():
    print("\n--- Testing Module 7 Job Integration ---")
    
    with patch("app.services.broadcast_job.SessionLocal") as MockSessionLocal, \
         patch("app.services.broadcast_job.alert_service") as mock_alert_service:
        
        mock_db = MockSessionLocal.return_value
        
        # Case 1: Lock NOT acquired
        print("Step 2.1: Testing job behavior when lock is NOT acquired...")
        mock_alert_service.acquire_job_lock.return_value = False
        
        run_alert_broadcast_job()
        
        # Should return early and NOT call other services
        mock_alert_service.expire_old_alerts.assert_not_called()
        mock_alert_service.get_eligible_alerts.assert_not_called()
        mock_alert_service.release_job_lock.assert_not_called()
        print("Pass: Job skipped execution correctly")
        
        # Case 2: Lock acquired
        print("Step 2.2: Testing job behavior when lock IS acquired...")
        mock_alert_service.acquire_job_lock.return_value = True
        mock_alert_service.get_eligible_alerts.return_value = [] # End early for simplicity
        
        run_alert_broadcast_job()
        
        # Should proceed to fetch alerts and eventually release lock
        mock_alert_service.expire_old_alerts.assert_called_once()
        mock_alert_service.release_job_lock.assert_called_once()
        print("Pass: Job proceeded and released lock correctly")

if __name__ == "__main__":
    print("--- STARTING MODULE 7 TEST (MULTI-INSTANCE LOCK) ---")
    try:
        test_module_7_lock_functions()
        test_module_7_job_integration()
        print("\n--- MODULE 7 TESTS COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
