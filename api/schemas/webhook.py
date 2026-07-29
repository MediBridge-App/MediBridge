from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


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