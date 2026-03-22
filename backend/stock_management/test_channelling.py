import sys
from app.database.db import SessionLocal
from app.repositories.channelling_repo import ChannellingRepository

try:
    print("Testing Channelling Models Query...")
    db = SessionLocal()
    repo = ChannellingRepository(db)
    
    doctors = repo.get_all_doctors()
    print(f"Successfully fetched {len(doctors)} doctors from the live database:")
    for doc in doctors[:3]:
        print(f" - {doc.name} ({doc.specialization}) at {doc.hospital}")
        
    db.close()
    
except Exception as e:
    print(f"Test Failed with exception: {e}")
    sys.exit(1)
