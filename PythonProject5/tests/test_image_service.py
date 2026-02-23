"""
test_image_service.py
─────────────────────
Tests for app/services/image_service.py

Covers:
  ✅ Clear image → passes all three OpenCV checks
  ✅ Blurry (solid grey) image → fails Laplacian variance check
  ✅ Dark image → fails brightness check
  ✅ Corrupt / non-image bytes → returns False safely
  ✅ Empty bytes → returns False safely
"""
import pytest
from tests.conftest import make_clear_image_bytes, make_blurry_image_bytes, make_dark_image_bytes
from app.services.image_service import is_image_clear


class TestImageClarity:

    def test_clear_image_passes(self):
        """A sharp image with fine grid detail must pass all clarity checks."""
        img_bytes = make_clear_image_bytes()
        result = is_image_clear(img_bytes)
        assert result is True, "Expected clear grid image to pass clarity check"

    def test_blurry_image_fails(self):
        """A solid-colour (zero-variance) image must fail the blur check."""
        img_bytes = make_blurry_image_bytes()
        result = is_image_clear(img_bytes)
        assert result is False, "Expected solid-grey image to fail blur check"

    def test_dark_image_fails(self):
        """A near-black image must fail the brightness check."""
        img_bytes = make_dark_image_bytes()
        result = is_image_clear(img_bytes)
        assert result is False, "Expected very dark image to fail brightness check"

    def test_corrupt_bytes_returns_false(self):
        """Random bytes that are not a valid image must return False (no exception)."""
        garbage = b"not_an_image_" * 50
        result = is_image_clear(garbage)
        assert result is False, "Expected corrupt bytes to return False"

    def test_empty_bytes_returns_false(self):
        """Empty byte string must return False without raising."""
        result = is_image_clear(b"")
        assert result is False, "Expected empty bytes to return False"

    def test_custom_thresholds_tight(self):
        """Using very tight thresholds should reject even a borderline image."""
        img_bytes = make_clear_image_bytes()
        # Set Laplacian threshold absurdly high → should fail
        result = is_image_clear(img_bytes, min_laplacian_var=99999.0)
        assert result is False, "Expected tight threshold to reject image"

    def test_custom_thresholds_loose(self):
        """Using very loose thresholds should accept even a slightly blurry image."""
        img_bytes = make_blurry_image_bytes()
        # Near-zero thresholds → should pass
        result = is_image_clear(
            img_bytes,
            min_laplacian_var=0.0,
            min_brightness=0.0,
            min_edge_pct=0.0,
        )
        assert result is True, "Expected all-zero thresholds to accept any image"
