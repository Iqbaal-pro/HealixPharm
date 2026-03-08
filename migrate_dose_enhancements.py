import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "Angel@0602!")
os.environ.setdefault("DB_NAME", "healixpharm")

from app.database.connection import engine

def run_migration():
    with engine.begin() as conn:
        print("Adding dose reminder enhancement columns to prescriptions table...")
        try:
            conn.execute(text("ALTER TABLE prescriptions ADD COLUMN reminder_type VARCHAR(50) AFTER start_time;"))
            conn.execute(text("ALTER TABLE prescriptions ADD COLUMN duration_days INTEGER AFTER reminder_type;"))
            print("Successfully added reminder_type and duration_days.")
        except Exception as e:
            print(f"Migration Note (likely already exists): {e}")
        
        print("Done!")

if __name__ == "__main__":
    run_migration()
