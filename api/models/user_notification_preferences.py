from sqlalchemy import Column, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class UserNotificationPreferences(Base):

    __tablename__ = "user_notification_preferences"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )


    document_delivered = Column(
        Boolean,
        default=True
    )


    document_read = Column(
        Boolean,
        default=True
    )


    urgent_documents = Column(
        Boolean,
        default=True
    )


    audit_events = Column(
        Boolean,
        default=False
    )


    ai_processing_complete = Column(
        Boolean,
        default=True
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