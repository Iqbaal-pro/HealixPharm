import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine
from app.models import UserState

def run():
    print("Creating user_states table...")
    UserState.__table__.create(engine, checkfirst=True)
    print("Done! The 'user_states' table has been created successfully.")

if __name__ == "__main__":
    run()
