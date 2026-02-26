import cv2
import numpy as np
import logging
from io import BytesIO

logger = logging.getLogger(__name__)


def _bytes_to_cv_image(image_bytes: bytes):
    """Convert raw image bytes into an OpenCV image (BGR)."""
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


def is_image_clear(image_bytes: bytes, min_laplacian_var: float = 100.0, min_brightness: float = 50.0, min_edge_pct: float = 0.01) -> bool:
    """
    Validate image clarity using multiple heuristics:
    - Laplacian variance (blur detection)
    - Brightness (mean intensity)
    - Edge density (Canny edges percent)

    Returns True if the image passes all checks.
    """
    try:
        img = _bytes_to_cv_image(image_bytes)
        if img is None:
            logger.warning("[IMG_SERVICE] Could not decode image bytes")
            return False

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Blur check: variance of Laplacian
        lap = cv2.Laplacian(gray, cv2.CV_64F)
        lap_var = lap.var()
        logger.debug(f"[IMG_SERVICE] Laplacian variance: {lap_var}")

        if lap_var < min_laplacian_var:
            logger.info("[IMG_SERVICE] Image too blurry")
            return False

        # Brightness check: mean pixel intensity
        mean_brightness = gray.mean()
        logger.debug(f"[IMG_SERVICE] Mean brightness: {mean_brightness}")
        if mean_brightness < min_brightness:
            logger.info("[IMG_SERVICE] Image too dark")
            return False

        # Edge density: proportion of edge pixels
        edges = cv2.Canny(gray, 100, 200)
        edge_pct = (edges > 0).sum() / float(edges.size)
        logger.debug(f"[IMG_SERVICE] Edge percent: {edge_pct}")
        if edge_pct < min_edge_pct:
            logger.info("[IMG_SERVICE] Not enough edges detected (possible blank or low detail image)")
            return False

        logger.info("[IMG_SERVICE] Image passed clarity checks")
        return True

    except Exception as e:
        logger.error(f"[IMG_SERVICE] Error validating image: {e}", exc_info=True)
        return False
