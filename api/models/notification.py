import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Notification(Base):

    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)

    type = Column(String(100), nullable=False)

    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    document = relationship("Document")