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
        print("Adding date_of_birth column to patients table...")
        # Check if column exists first (optional but safer)
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN date_of_birth VARCHAR(600) AFTER phone_number;"))
            print("Successfully added date_of_birth.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("Column date_of_birth already exists.")
            else:
                print(f"Error adding column: {e}")
        
        print("Done!")

if __name__ == "__main__":
    run_migration()
