from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class OrganizationResponse(BaseModel):

    id: UUID
    name: str
    org_code: str
    type: str | None
    timezone: str | None
    date_format: str | None
    language: str | None
    created_at: datetime


    class Config:
        from_attributes = True



class OrganizationUpdate(BaseModel):

    name: str | None = None
    type: str | None = None
    timezone: str | None = None
    date_format: str | None = None
    language: str | None = None