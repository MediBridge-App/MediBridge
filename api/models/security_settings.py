from sqlalchemy import Column, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class SecuritySettings(Base):

    __tablename__ = "security_settings"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False,
        unique=True
    )


    mfa_enabled = Column(
        Boolean,
        default=True
    )


    ip_allowlisting_enabled = Column(
        Boolean,
        default=False
    )


    session_timeout_minutes = Column(
        Integer,
        default=30
    )


    last_security_scan = Column(
        DateTime,
        nullable=True
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )