from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class SecuritySettingsResponse(BaseModel):

    id: UUID

    organization_id: UUID

    mfa_enabled: bool

    ip_allowlisting_enabled: bool

    session_timeout_minutes: int

    last_security_scan: datetime | None

    created_at: datetime

    updated_at: datetime


    class Config:
        from_attributes = True



class SecuritySettingsUpdate(BaseModel):

    mfa_enabled: bool | None = None

    ip_allowlisting_enabled: bool | None = None

    session_timeout_minutes: int | None = None