from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class NotificationPreferencesResponse(BaseModel):

    id: UUID

    user_id: UUID

    document_delivered: bool

    document_read: bool

    urgent_documents: bool

    audit_events: bool

    ai_processing_complete: bool

    created_at: datetime

    updated_at: datetime


    class Config:
        from_attributes = True



class NotificationPreferencesUpdate(BaseModel):

    document_delivered: bool | None = None

    document_read: bool | None = None

    urgent_documents: bool | None = None

    audit_events: bool | None = None

    ai_processing_complete: bool | None = None