from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class Notification(Base):

    __tablename__ = "notifications"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )


    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=True
    )


    type = Column(
        String(100),
        nullable=False
    )


    message = Column(
        Text,
        nullable=False
    )


    is_read = Column(
        Boolean,
        default=False
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )