"""
run_tests.py
────────────
Run the HealixPharm test suite without the Desktop sys.path issue.

The file C:/Users/ADMIN/Desktop/py.py shadows the real `py` library.
This launcher strips the Desktop from sys.path BEFORE importing pytest.

Usage:
    python run_tests.py               → run all tests
    python run_tests.py -v            → verbose
    python run_tests.py tests/test_image_service.py -v  → specific file
"""
import sys
import os

# ── Remove Desktop from path so the real `py` package is used ─────────────
sys.path = [p for p in sys.path if "Desktop" not in p]

# ── Add project root to path ───────────────────────────────────────────────
ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# ── Now safe to import and run pytest ──────────────────────────────────────
import pytest  # noqa: E402

if __name__ == "__main__":
    args = sys.argv[1:] if len(sys.argv) > 1 else ["tests/", "-v", "--tb=short"]
    sys.exit(pytest.main(args))
