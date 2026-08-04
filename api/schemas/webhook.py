from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WebhookCreate(BaseModel):

    name: str

    url: str

    events: list[str]


class WebhookResponse(BaseModel):

    id: UUID

    name: str

    url: str

    events: list[str] | None

    is_active: bool

    created_at: datetime

    class Config:
        from_attributes = True
