from pydantic import BaseModel


class UploadRequest(BaseModel):
    filename: str
    content_type: str


class UploadResponse(BaseModel):
    upload_url: str
    s3_key: str