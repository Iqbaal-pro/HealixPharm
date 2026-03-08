import sys
import os
import urllib.parse
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ne')))
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "Angel@0602!")
os.environ.setdefault("DB_NAME", "healixpharm")

from app.database.connection import engine

def run_migration():
    with engine.begin() as conn:
        print("Expanding patient columns to hold encrypted Data...")
        # Alter the columns to allow up to 600 characters
        conn.execute(text("ALTER TABLE patients MODIFY COLUMN name VARCHAR(600);"))
        conn.execute(text("ALTER TABLE patients MODIFY COLUMN phone_number VARCHAR(600);"))
        conn.execute(text("ALTER TABLE patients MODIFY COLUMN language VARCHAR(600);"))
        print("Done!")

if __name__ == "__main__":
    run_migration()
