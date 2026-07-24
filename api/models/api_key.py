from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class APIKey(Base):

    __tablename__ = "api_keys"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )


    name = Column(
        String(100),
        nullable=False
    )


    key_prefix = Column(
        String(20),
        nullable=False
    )


    key_hash = Column(
        String(255),
        nullable=False
    )


    is_active = Column(
        Boolean,
        default=True
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    last_used_at = Column(
        DateTime,
        nullable=True
    )