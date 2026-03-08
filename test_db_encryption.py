# test_db_encryption.py
import sys
import os

# Set fallbacks in case environment variables aren't set in the terminal
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "Angel@0602!")
os.environ.setdefault("DB_NAME", "healixpharm")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))

from sqlalchemy import text
from app.database.connection import SessionLocal
from app.models.patient import Patient

def run_test():
    # 1. Connect to your database
    db = SessionLocal()
    
    try:
        print("\n--- 1. Creating a new patient ---")
        # Give normal plain-text strings to the Patient object
        new_patient = Patient(
            name="Test Patient", 
            phone_number="+94000111222", 
            date_of_birth="1990-01-01",
            language="en"
        )
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        
        patient_id = new_patient.id
        print(f"SUCCESS: Saved patient with ID: {patient_id}")
        
        print("\n--- 2. How it looks inside the Python object ---")
        print(f"p.name (Decrypted):          {new_patient.name}")
        print(f"p.phone_number (Decrypted):  {new_patient.phone_number}")
        print(f"p.date_of_birth (Decrypted): {new_patient.date_of_birth}")
        print(f"p.language (Plain Text):     {new_patient.language}")

        print("\n--- 3. Let's make sure it's actually saving correctly in the database ---")
        # Let's bypass SQLAlchemy to look directly at what's in the DB right now using raw SQL
        result = db.execute(text(f"SELECT name, phone_number, date_of_birth, language FROM patients WHERE id = {patient_id}")).fetchone()
        
        print(f"Raw Database NAME field:  {result[0]}")
        print(f"Raw Database PHONE field: {result[1]}")
        print(f"Raw Database DOB field:   {result[2]}")
        print(f"Raw Database LANG field:  {result[3]}")
        
        # Simple assertions for verification in the output
        if result[0].startswith("gAAAAA") and result[1].startswith("gAAAAA") and result[2].startswith("gAAAAA"):
            print("\nVERIFICATION: SUCCESS! Name, Phone, and DOB are ENCRYPTED in DB.")
        else:
            print("\nVERIFICATION: FAILED! One or more fields are NOT encrypted.")

        if result[3] == "en":
            print("VERIFICATION: SUCCESS! Language is PLAIN TEXT in DB.")
        else:
            print(f"VERIFICATION: FAILED! Language is NOT plain text (found: {result[3]})")
        
        # Clean up (Optional - we can delete the test patient)
        db.delete(new_patient)
        db.commit()
        print("\nSUCCESS: Test finished! (Test patient deleted)")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
