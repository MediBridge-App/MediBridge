from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentCreate(BaseModel):
    recipient_org_id: UUID

    document_type: str | None = None
    subject: str | None = None

    priority: str = "normal"

    file_s3_key: str
    original_filename: str | None = None
    file_size: int | None = None

    notes: str | None = None


class DocumentResponse(BaseModel):
    id: UUID

    tx_ref: str

    sender_org_id: UUID
    recipient_org_id: UUID
    uploaded_by_user_id: UUID

    sender_org_name: str | None = None
    recipient_org_name: str | None = None

    document_type: str | None = None
    subject: str | None = None

    priority: str
    status: str

    file_s3_key: str | None = None
    original_filename: str | None = None
    file_size: int | None = None

    notes: str | None = None

    created_at: datetime

    delivered_at: datetime | None = None
    read_at: datetime | None = None
    urgency_detected: bool | None = None

    summary: str | None = None
    tags: list[str] | None = None

    class Config:
        from_attributes = True


class UploadURLRequest(BaseModel):
    filename: str
    content_type: str
    document_type: str | None = None


class DocumentStatusUpdate(BaseModel):
    status: str
