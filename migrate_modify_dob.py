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
        print("Changing date_of_birth column type to VARCHAR(600)...")
        try:
            conn.execute(text("ALTER TABLE patients MODIFY COLUMN date_of_birth VARCHAR(600);"))
            print("Successfully modified date_of_birth.")
        except Exception as e:
            print(f"Error modifying column: {e}")
        
        print("Done!")

if __name__ == "__main__":
    run_migration()
