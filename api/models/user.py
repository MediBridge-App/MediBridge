from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    cognito_id = Column(
        String(255),
        unique=True,
        nullable=False
    )

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    last_login = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )