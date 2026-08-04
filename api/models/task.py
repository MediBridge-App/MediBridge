import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class Task(Base):

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)

    assigned_to_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    created_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    title = Column(String(255), nullable=False)

    status = Column(String(50), default="open")

    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
