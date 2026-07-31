from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal


class AIAnalysisCreate(BaseModel):

    document_id: UUID

    document_type: str | None = None

    summary: str | None = None

    tags: list[str] | None = None

    recommendation_text: str | None = None

    recommendation_type: str | None = None

    urgency_detected: bool = False

    confidence_score: Decimal | None = None

    processing_time_ms: int | None = None

    model_used: str | None = None

    status: str = "complete"