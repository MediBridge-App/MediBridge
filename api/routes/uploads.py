from fastapi import APIRouter

from schemas.upload import (
    UploadRequest,
    UploadResponse
)

from services.s3 import (
    generate_presigned_upload_url
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post(
    "/upload-url",
    response_model=UploadResponse
)
def create_upload_url(
    request: UploadRequest
):

    return generate_presigned_upload_url(
        request.filename,
        request.content_type
    )