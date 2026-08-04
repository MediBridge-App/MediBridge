import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID

from database import Base


class Webhook(Base):

    __tablename__ = "webhooks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False,
    )

    name = Column(String(100), nullable=False)

    url = Column(Text, nullable=False)

    events = Column(ARRAY(String), nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )