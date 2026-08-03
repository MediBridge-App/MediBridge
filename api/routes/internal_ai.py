from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database import get_db

from dependencies.internal_auth import verify_internal_api_key

from models.ai_analysis import AIAnalysis
from models.document import Document

from schemas.internal_ai import AIAnalysisCreate

from services.audit import create_audit_log

router = APIRouter(prefix="/internal/ai", tags=["Internal AI"])


@router.post("/analyses")
def create_or_update_analysis(
    body: AIAnalysisCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_internal_api_key),
):

    try:

        document = db.query(Document).filter(Document.id == body.document_id).first()

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        analysis = (
            db.query(AIAnalysis)
            .filter(AIAnalysis.document_id == body.document_id)
            .first()
        )

        if analysis:

            # Update existing AI analysis
            for field, value in body.model_dump(exclude_unset=True).items():
                setattr(analysis, field, value)

            action = "AI analysis updated by Lambda service"

        else:

            # Create new AI analysis
            analysis = AIAnalysis(**body.model_dump())

            db.add(analysis)

            action = "AI analysis created by Lambda service"

        # Update document workflow status
        document.status = "classified"

        db.flush()

        create_audit_log(
            db=db,
            event_type="ai_analysis_completed",
            action=action,
            document_id=document.id,
            user_id=None,
            organization_id=document.recipient_org_id,
            details={"source": "lambda", "model": body.model_used},
        )

        db.commit()

        db.refresh(analysis)

        return {
            "message": "AI analysis saved successfully",
            "analysis": {
                "id": analysis.id,
                "document_id": analysis.document_id,
                "ai_summary": analysis.ai_summary,
                "ai_tags": analysis.ai_tags,
                "urgency_detected": analysis.urgency_detected,
                "model_used": analysis.model_used,
            },
        }

    except HTTPException:
        raise

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(status_code=500, detail="Unable to save AI analysis")
