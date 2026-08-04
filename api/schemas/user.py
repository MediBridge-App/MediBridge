from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    role: str

    specialty: str | None = None
    npi_number: str | None = None

    is_active: bool
    last_login: datetime | None = None

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: str


class UserStatusUpdate(BaseModel):
    is_active: bool
