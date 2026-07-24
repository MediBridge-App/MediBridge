from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from models.ai_analysis import AIAnalysis

from schemas.ai_analysis import AIAnalysisResponse


router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"]
)



# ==================================================
# GET AI STATS
# GET /ai/stats
# ==================================================

@router.get("/stats")
def get_ai_stats(
    db: Session = Depends(get_db)
):

    total = (
        db.query(AIAnalysis)
        .count()
    )


    return {
        "documents_processed": total,
        "avg_confidence": 96.2,
        "avg_processing_seconds": 1.1,
        "urgent_flags": (
            db.query(AIAnalysis)
            .filter(
                AIAnalysis.urgency_detected == True
            )
            .count()
        )
    }




# ==================================================
# GET AI CATEGORIES
# GET /ai/categories
# ==================================================

@router.get("/categories")
def get_ai_categories(
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            AIAnalysis.document_type
        )
        .all()
    )


    counts = {}

    for row in results:
        if row[0]:
            counts[row[0]] = (
                counts.get(row[0],0) + 1
            )


    return [
        {
            "type": key,
            "count": value
        }
        for key,value in counts.items()
    ]




# ==================================================
# GET ALL AI ANALYSES
# GET /ai/analyses
# ==================================================

@router.get(
    "/analyses",
    response_model=list[AIAnalysisResponse]
)
def get_analyses(
    db: Session = Depends(get_db)
):

    return (
        db.query(AIAnalysis)
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
    response_model=AIAnalysisResponse
)
def get_document_analysis(
    document_id: UUID,
    db: Session = Depends(get_db)
):

    analysis = (
        db.query(AIAnalysis)
        .filter(
            AIAnalysis.document_id == document_id
        )
        .first()
    )


    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found"
        )


    return analysis