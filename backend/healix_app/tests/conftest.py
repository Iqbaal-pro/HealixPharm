"""
conftest.py — shared fixtures for the HealixPharm test suite
"""
# ─── Fix: remove Desktop from sys.path (Desktop/py.py shadows the real `py` package) ──
import sys
sys.path = [p for p in sys.path if "Desktop" not in p]

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db import Base
from app.main import app


# ─── In-memory SQLite for tests ────────────────────────────────────────────────
TEST_DB_URL = "sqlite:///./test_healix.db"

engine_test = create_engine(
    TEST_DB_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables once for the test session, drop after."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture()
def db_session():
    """Yield a clean DB session per test, roll back after."""
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client():
    """FastAPI test client using real app."""
    with TestClient(app) as c:
        yield c


# ─── Helpers ───────────────────────────────────────────────────────────────────
def make_blurry_image_bytes() -> bytes:
    """Return bytes of a solid-grey (100% blurry) JPEG via OpenCV."""
    import cv2
    import numpy as np
    img = np.full((300, 300, 3), 128, dtype=np.uint8)   # solid grey → zero variance
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def make_clear_image_bytes() -> bytes:
    """Return bytes of a synthetic image that passes clarity checks."""
    import cv2
    import numpy as np
    # Draw a black-on-white grid — high variance, high edge density, bright
    img = np.full((300, 300, 3), 255, dtype=np.uint8)
    for i in range(0, 300, 20):
        cv2.line(img, (i, 0), (i, 300), (0, 0, 0), 2)
        cv2.line(img, (0, i), (300, i), (0, 0, 0), 2)
    cv2.putText(img, "PRESCRIPTION", (20, 150),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def make_dark_image_bytes() -> bytes:
    """Return bytes of a very dark image that fails the brightness check."""
    import cv2
    import numpy as np
    img = np.full((300, 300, 3), 5, dtype=np.uint8)   # near-black
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()
