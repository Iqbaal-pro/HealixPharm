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
        print("Adding total_quantity column to prescriptions table...")
        try:
            conn.execute(text("ALTER TABLE prescriptions ADD COLUMN total_quantity INTEGER AFTER medicine_name;"))
            print("Successfully added total_quantity.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("Column total_quantity already exists.")
            else:
                print(f"Error adding column: {e}")
        
        print("Done!")

if __name__ == "__main__":
    run_migration()
