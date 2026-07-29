from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, ForeignKey, Numeric, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class AIAnalysis(Base):

    __tablename__ = "ai_analyses"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    document_type = Column(
        String(100),
        nullable=True
    )


    summary = Column(
        Text,
        nullable=True
    )


    tags = Column(
        ARRAY(String),
        nullable=True
    )


    recommendation_text = Column(
        Text,
        nullable=True
    )


    recommendation_type = Column(
        String(100),
        nullable=True
    )


    urgency_detected = Column(
        Boolean,
        default=False
    )


    confidence_score = Column(
        Numeric(5,2),
        nullable=True
    )


    processing_time_ms = Column(
        Integer,
        nullable=True
    )


    model_used = Column(
        String(100),
        nullable=True
    )


    status = Column(
        String(50),
        default="complete"
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )