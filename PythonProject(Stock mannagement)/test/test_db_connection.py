from app.database.db import engine

def test_db_connection():
    connection = engine.connect()
    print(" Database connected")
    connection.close()

test_db_connection()
