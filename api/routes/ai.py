from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.ai_analysis import AIAnalysis
from models.document import Document
from schemas.ai_analysis import AIAnalysisResponse

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


# ==================================================
# GET AI STATS
# GET /ai/stats
# ==================================================

@router.get("/stats")
def get_ai_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    org_id = current_user.organization_id

    base_query = (
        db.query(AIAnalysis)
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            Document.recipient_org_id == org_id
        )
    )

    documents_processed = base_query.count()

    urgent_flags = (
        base_query
        .filter(
            AIAnalysis.urgency_detected.is_(True)
        )
        .count()
    )

    avg_confidence = (
        db.query(func.avg(AIAnalysis.confidence_score))
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            Document.recipient_org_id == org_id
        )
        .scalar()
    )

    avg_processing_ms = (
        db.query(func.avg(AIAnalysis.processing_time_ms))
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            Document.recipient_org_id == org_id
        )
        .scalar()
    )

    return {
        "documents_processed": documents_processed,

        "avg_confidence": (
            round(float(avg_confidence), 2)
            if avg_confidence is not None
            else 0
        ),

        "avg_processing_seconds": (
            round(float(avg_processing_ms) / 1000, 2)
            if avg_processing_ms is not None
            else 0
        ),

        "urgent_flags": urgent_flags,
    }


# ==================================================
# GET AI CATEGORIES
# GET /ai/categories
# ==================================================

@router.get("/categories")
def get_ai_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    results = (
        db.query(AIAnalysis.document_type)
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            Document.recipient_org_id == current_user.organization_id
        )
        .all()
    )

    counts = {}

    for row in results:
        document_type = row[0]

        if document_type:
            counts[document_type] = counts.get(document_type, 0) + 1

    return [
        {
            "type": key,
            "count": value,
        }
        for key, value in counts.items()
    ]


# ==================================================
# GET ALL AI ANALYSES
# GET /ai/analyses
# ==================================================

@router.get(
    "/analyses",
    response_model=list[AIAnalysisResponse],
)
def get_analyses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return (
        db.query(AIAnalysis)
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            Document.recipient_org_id == current_user.organization_id
        )
        .order_by(
            AIAnalysis.created_at.desc()
        )
        .all()
    )


# ==================================================
# GET AI ANALYSIS BY DOCUMENT
# GET /ai/analyses/{document_id}
# ==================================================

@router.get(
    "/analyses/{document_id}",
    response_model=AIAnalysisResponse,
)
def get_document_analysis(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    analysis = (
        db.query(AIAnalysis)
        .join(
            Document,
            AIAnalysis.document_id == Document.id,
        )
        .filter(
            AIAnalysis.document_id == document_id,
            Document.recipient_org_id == current_user.organization_id,
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found",
        )

    return analysis