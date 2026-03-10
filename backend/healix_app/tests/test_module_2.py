import sys
import os
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.main import app

client = TestClient(app)

def test_create_moh_alert_success():
    print("\n--- Testing Successful MOH Alert Creation ---")
    payload = {
        "disease_name": "Dengue Fever",
        "region": "Colombo",
        "threat_level": "High",
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=30)).isoformat()
    }
    response = client.post("/admin/moh-alert/create", json=payload)
    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {response.json()}")
    assert response.status_code == 200
    data = response.json()
    assert data["disease_name"] == "Dengue Fever"
    assert data["status"] == "Active"
    assert data["broadcast_sent"] is False
    assert data["retry_count"] == 0

def test_create_moh_alert_validation_failures():
    print("\n--- Testing MOH Alert Validation Failures ---")
    
    # 1. Empty disease_name
    print("Testing empty disease_name...")
    payload = {
        "disease_name": " ",
        "region": "Colombo",
        "threat_level": "High",
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=30)).isoformat()
    }
    response = client.post("/admin/moh-alert/create", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "disease_name not empty"
    print("Pass: Caught empty disease_name")

    # 2. Invalid threat_level
    print("Testing invalid threat_level...")
    payload["disease_name"] = "Dengue"
    payload["threat_level"] = "Extreme"
    response = client.post("/admin/moh-alert/create", json=payload)
    assert response.status_code == 400
    assert "threat_level must be Low, Medium, or High" in response.json()["detail"]
    print("Pass: Caught invalid threat_level")

    # 3. Invalid dates (start > end)
    print("Testing invalid dates (start > end)...")
    payload["threat_level"] = "High"
    payload["start_date"] = (datetime.now() + timedelta(days=10)).isoformat()
    payload["end_date"] = datetime.now().isoformat()
    response = client.post("/admin/moh-alert/create", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "start_date <= end_date"
    print("Pass: Caught invalid dates")

if __name__ == "__main__":
    try:
        test_create_moh_alert_success()
        test_create_moh_alert_validation_failures()
        print("\n--- MODULE 2 TESTS COMPLETED SUCCESSFULLY ---")
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        sys.exit(1)
