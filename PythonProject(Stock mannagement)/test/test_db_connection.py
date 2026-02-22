import pytest
from app.database.db import engine


def test_db_connection():
    try:
        connection = engine.connect()
        connection.close()
    except Exception:
        pytest.skip("MySQL not available for integration test")
