from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserResponse(BaseModel):

    id: UUID
    full_name: str
    role: str

    specialty: str | None = None

    is_active: bool
    last_login: datetime | None = None


    class Config:
        from_attributes = True



class UserRoleUpdate(BaseModel):

    role: str



class UserStatusUpdate(BaseModel):

    is_active: bool