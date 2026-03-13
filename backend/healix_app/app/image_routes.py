from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.image_service import is_image_clear

router = APIRouter(prefix="/api/image", tags=["Image"])

@router.post("/check-clarity")
async def check_image_clarity(file: UploadFile = File(...)):
    """Check if an uploaded image is clear enough (not blurry or too dark)."""
    try:
        contents = await file.read()
        if is_image_clear(contents):
            return {"status": "success", "is_clear": True, "message": "Image passed clarity checks"}
        else:
            return {"status": "failure", "is_clear": False, "message": "Image is too blurry, dark, or lacks detail"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
