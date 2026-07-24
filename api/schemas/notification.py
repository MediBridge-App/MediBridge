from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class NotificationResponse(BaseModel):

    id: UUID
    type: str
    message: str
    is_read: bool
    document_id: UUID | None
    created_at: datetime


    class Config:
        from_attributes = True