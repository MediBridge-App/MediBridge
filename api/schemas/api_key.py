from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class APIKeyCreate(BaseModel):

    name: str


class APIKeyResponse(BaseModel):

    id: UUID

    name: str

    key_prefix: str

    is_active: bool

    created_at: datetime

    last_used_at: datetime | None

    class Config:
        from_attributes = True


class APIKeyCreatedResponse(BaseModel):

    id: UUID

    name: str

    key: str

    created_at: datetime
