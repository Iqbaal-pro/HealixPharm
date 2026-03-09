import os
import json
from fastapi.testclient import TestClient
from unittest.mock import patch

# Force SQLite for demo
os.environ["DATABASE_URL"] = "sqlite:///./demo_presc.db"
os.environ["CHANNELLING_DATABASE_URL"] = "sqlite:///./demo_presc.db"

from app.main import app
from app.db import Base, engine, SessionLocal
from app.services.order_service import get_or_create_user, create_order_with_prescription

# Setup Demo DB
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def run_demo():
    print("--- Seeding Demo Data ---")
    db = SessionLocal()
    user = get_or_create_user(db, phone="+94770001112", name="Demo User")
    order, prescription = create_order_with_prescription(
        db, 
        user, 
        image_s3_key="prescriptions/demo_task_123.jpg",
        s3_url="http://expired-link.com/old.jpg"
    )
    db.commit()
    print(f"Created Order: {order.token} for {user.phone}")
    db.close()

    print("\n--- Fetching Prescription Queue (MOCKING AWS S3) ---")
    with patch("app.admin.routes.s3_service") as mock_s3:
        # Mocking the dynamic URL generation
        mock_s3.generate_presigned_url.return_value = "https://healix-prescriptions.s3.amazonaws.com/prescriptions/demo_task_123.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=20260309T230000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=..."
        
        response = client.get("/admin/prescriptions/queue")
        
        if response.status_code == 200:
            print("Response Status: 200 OK")
            print("Queue Content:")
            print(json.dumps(response.json(), indent=4))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    run_demo()
