from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AIAnalysisResponse(BaseModel):
    id: UUID

    document_id: UUID

    document_type: str | None

    summary: str | None

    tags: list[str] | None

    recommendation_text: str | None

    recommendation_type: str | None

    urgency_detected: bool

    confidence_score: float | None

    processing_time_ms: int | None

    model_used: str | None

    status: str

    created_at: datetime

    class Config:
        from_attributes = True