from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):

    id: UUID
    email: str
    full_name: str
    role: str
    organization_id: UUID

    specialty: str | None = None
    npi_number: str | None = None

    organization_name: str | None = None
    org_code: str | None = None

    last_login: datetime | None = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):

    access_token: str
    id_token: str
    refresh_token: str | None = None
    token_type: str
    user: UserResponse
