import sys
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.config import settings

def verify_schema():
    database_url = settings.DATABASE_URL
    
    if not database_url or "PASSWORD_HERE" in database_url:
        print("Error: Please set your actual database password in the .env file first.")
        return

    print(f"Connecting to: {database_url.split('@')[-1]}") # Print host/db only for security
    
    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)
        
        # Define expected schema
        expected = {
            "patients": ["id", "phone_number", "is_active"],
            "moh_disease_alerts": [
                "id", "disease_name", "region", "threat_level", 
                "start_date", "end_date", "status", "broadcast_sent", 
                "retry_count", "last_attempt_at", "created_at", "updated_at"
            ],
            "alert_broadcast_log": [
                "id", "alert_id", "phone_number", "send_status", "api_response", "created_at"
            ],
            "users": ["id", "phone", "name", "created_at"],
            "orders": ["id", "token", "status", "user_id", "created_at"],
            "prescriptions": ["id", "prescription_id", "order_id", "s3_key", "s3_url", "notes", "created_at"]
        }
        
        all_passed = True
        existing_tables = inspector.get_table_names()
        
        print("\n--- SCHEMA VERIFICATION RESULTS ---")
        
        for table, expected_cols in expected.items():
            if table not in existing_tables:
                print(f"[X] Table '{table}' MISSING")
                all_passed = False
                continue
            
            # Get existing columns
            columns = [c["name"] for c in inspector.get_columns(table)]
            missing_cols = [c for c in expected_cols if c not in columns]
            
            if missing_cols:
                print(f"[X] Table '{table}' is MISSING columns: {', '.join(missing_cols)}")
                all_passed = False
            else:
                print(f"[OK] Table '{table}' structure is correct.")
                
        if all_passed:
            print("\nSUCCESS: All parameters in your MySQL database match the code definitions!")
        else:
            print("\nWARNING: Some mismatches were found. Please verify your MySQL Workbench setup.")
            
    except Exception as e:
        print(f"\nCONNECTION ERROR: Could not connect to MySQL. Verify your password and host settings.\nDetails: {e}")

if __name__ == "__main__":
    verify_schema()
