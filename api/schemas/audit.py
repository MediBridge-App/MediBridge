from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AuditResponse(BaseModel):

    id: UUID
    event_id: str

    document_id: UUID | None
    user_id: UUID | None
    organization_id: UUID | None

    event_type: str
    action: str

    details: dict | None

    ip_address: str | None
    hash: str | None

    created_at: datetime


    class Config:
        from_attributes = True