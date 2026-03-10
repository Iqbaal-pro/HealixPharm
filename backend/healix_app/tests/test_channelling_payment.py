import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from unittest.mock import MagicMock
from app.echannelling_service import update_appointment_status
from app.channelling_models import Appointment

def test_update_appointment_status_paid():
    db = MagicMock()
    mock_appointment = Appointment(payhere_order_id="TEST_ORD", status="PENDING_PAYMENT")
    db.query.return_value.filter.return_value.first.return_value = mock_appointment
    
    # Status code 2 should be PAID
    result = update_appointment_status(db, "TEST_ORD", 2)
    
    assert result is not None
    assert result.status == "PAID"
    db.commit.assert_called_once()

def test_update_appointment_status_failed():
    db = MagicMock()
    mock_appointment = Appointment(payhere_order_id="TEST_ORD", status="PENDING_PAYMENT")
    db.query.return_value.filter.return_value.first.return_value = mock_appointment
    
    # Any other status code should be FAILED
    result = update_appointment_status(db, "TEST_ORD", 3)
    
    assert result is not None
    assert result.status == "FAILED"
    
    result = update_appointment_status(db, "TEST_ORD", -1)
    assert result.status == "FAILED"
    
    result = update_appointment_status(db, "TEST_ORD", 0)
    assert result.status == "FAILED"

def test_update_appointment_status_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    
    result = update_appointment_status(db, "MISSING_ORD", 2)
    assert result is None
