"""Insert a patient row into the patients table."""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.db import SessionLocal
from app.models.patient import Patient

db = SessionLocal()

try:
    patient = Patient()
    patient.member_id = "PAT001"
    patient.name = "maneth"
    patient.phone_number = "0750662454"
    patient.date_of_birth = "2005-01-27"
    patient.age = 21
    patient.language = "en"
    patient.consent = True

    db.add(patient)
    db.commit()
    db.refresh(patient)

    print(f"✅ Patient inserted successfully!")
    print(f"   ID:    {patient.id}")
    print(f"   Name:  {patient.name}")
    print(f"   Phone: {patient.phone_number}")
    print(f"   DOB:   {patient.date_of_birth}")
    print(f"   Age:   {patient.age}")
    print(f"   Consent: {patient.consent}")
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
finally:
    db.close()
