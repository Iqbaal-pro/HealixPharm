from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import s3_service

router = APIRouter(prefix="/api/storage", tags=["Storage"])

@router.get("/presigned-url")
def get_presigned_url(key: str, expires_in: int = 3600):
    """Generate a presigned URL to view/download a prescription."""
    try:
        url = s3_service.generate_presigned_url(key, expires_in)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-prescription")
async def upload_prescription_file(prescription_id: str, file: UploadFile = File(...)):
    """Upload a prescription image directly to S3."""
    try:
        contents = await file.read()
        key = s3_service.upload_prescription(prescription_id, contents, file.content_type)
        return {"status": "success", "key": key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
