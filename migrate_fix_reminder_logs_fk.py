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
        print("Fixing reminder_logs foreign key constraint...")
        
        # 1. Drop the old foreign key
        try:
            conn.execute(text("ALTER TABLE reminder_logs DROP FOREIGN KEY reminder_logs_ibfk_1;"))
            print("Successfully dropped old foreign key reminder_logs_ibfk_1.")
        except Exception as e:
            print(f"Note (dropping FK): {e}")

        # 2. Add the new foreign key pointing to 'reminders' table
        try:
            conn.execute(text("ALTER TABLE reminder_logs ADD CONSTRAINT reminder_logs_ibfk_1 FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE;"))
            print("Successfully added new foreign key pointing to 'reminders'.")
        except Exception as e:
            print(f"Error adding new FK: {e}")
            
        print("Done!")

if __name__ == "__main__":
    run_migration()
