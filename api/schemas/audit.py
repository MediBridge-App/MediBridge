from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AuditResponse(BaseModel):

    id: UUID
    event_id: str

    document_id: UUID | None = None
    user_id: UUID | None = None
    organization_id: UUID | None = None

    user_name: str | None = None
    org_name: str | None = None

    event_type: str
    action: str

    details: dict | None = None

    ip_address: str | None = None
    hash: str | None = None

    created_at: datetime

    class Config:
        from_attributes = True