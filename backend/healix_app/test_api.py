import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_echannelling():
    print("--- Starting eChannelling API Tests ---")
    
    # 1. Get Doctors
    print("\n1. Testing GET /api/doctors...")
    r = requests.get(f"{BASE_URL}/api/doctors")
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Filters
    print("\nTesting GET /api/doctors with filters (spec=Cardiologist)...")
    r = requests.get(f"{BASE_URL}/api/doctors?spec=Cardiologist")
    print(f"Status: {r.status_code}, Count: {len(r.json())}")
    
    # 2. Get Single Doctor
    print("\n2. Testing GET /api/doctors/1...")
    r = requests.get(f"{BASE_URL}/api/doctors/1")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Name: {r.json().get('name')}")
    
    # 3. Get Slots
    print("\n3. Testing GET /api/doctors/1/slots...")
    params = {"hospital": "Nawaloka Hospital", "date": "2026-03-15"}
    r = requests.get(f"{BASE_URL}/api/doctors/1/slots", params=params)
    print(f"Status: {r.status_code}")
    print(f"Slots: {json.dumps(r.json(), indent=2)}")
    
    # 4. Book Appointment
    print("\n4. Testing POST /api/appointments...")
    payload = {
        "doctor_id": 1,
        "hospital": "Nawaloka Hospital",
        "slot_id": 1,
        "slot_time": "09:00 AM",
        "date": "2026-03-15",
        "patient": {
            "full_name": "Test Patient",
            "id_type": "NIC",
            "id_number": "199012345678",
            "email": "test@test.com",
            "phone": "+94771234567",
            "address": "123 Test Street, Colombo",
            "notes": "Test booking"
        }
    }
    r = requests.post(f"{BASE_URL}/api/appointments", json=payload)
    print(f"Status: {r.status_code}")
    resp_data = r.json()
    print(f"Response: {json.dumps(resp_data, indent=2)}")
    
    booking_ref = resp_data.get("booking_ref")
    
    # 5. Lookup Appointment
    if booking_ref:
        print(f"\n5. Testing GET /api/appointments/{booking_ref}...")
        r = requests.get(f"{BASE_URL}/api/appointments/{booking_ref}")
        print(f"Status: {r.status_code}")
        print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # 6. Try booking the same slot again
    print("\n6. Testing POST /api/appointments (duplicate slot)...")
    r = requests.post(f"{BASE_URL}/api/appointments", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")

if __name__ == "__main__":
    test_echannelling()
