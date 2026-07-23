from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    event_id = Column(
        String(50),
        unique=True,
        nullable=False
    )

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=True
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=True
    )

    event_type = Column(
        String(100),
        nullable=False
    )

    action = Column(
        Text,
        nullable=False
    )

    details = Column(
        JSON,
        nullable=True
    )

    ip_address = Column(
        String(45),
        nullable=True
    )

    hash = Column(
        String(64),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )