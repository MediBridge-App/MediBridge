from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class Document(Base):

    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    tx_ref = Column(
        String(50),
        unique=True,
        nullable=False
    )

    sender_org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )

    recipient_org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )

    uploaded_by_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    file_s3_key = Column(
        String(500),
        nullable=False
    )

    original_filename = Column(
        String(255),
        nullable=True
    )

    file_size = Column(
        Integer,
        nullable=True
    )

    document_type = Column(
        String(100),
        nullable=False
    )

    subject = Column(
        String(255),
        nullable=False
    )

    priority = Column(
        String(20),
        default="normal",
        nullable=False
    )

    status = Column(
        String(50),
        default="uploaded",
        nullable=False
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    delivered_at = Column(
        DateTime,
        nullable=True
    )

    read_at = Column(
        DateTime,
        nullable=True
    )