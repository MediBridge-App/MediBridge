from pydantic import BaseModel
from uuid import UUID


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

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):

    access_token: str
    token_type: str
    user: UserResponse