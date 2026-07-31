from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.internal_auth import verify_internal_api_key

from models.ai_analysis import AIAnalysis
from models.document import Document

from schemas.internal_ai import AIAnalysisCreate

from services.audit import create_audit_log


router = APIRouter(
    prefix="/internal/ai",
    tags=["Internal AI"]
)



@router.post("/analyses")
def create_or_update_analysis(
    body: AIAnalysisCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_internal_api_key)
):

    document = (
        db.query(Document)
        .filter(
            Document.id == body.document_id
        )
        .first()
    )


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    analysis = (
        db.query(AIAnalysis)
        .filter(
            AIAnalysis.document_id == body.document_id
        )
        .first()
    )


    if analysis:

        # update existing analysis

        for field, value in body.model_dump().items():

            setattr(
                analysis,
                field,
                value
            )


    else:

        # create new analysis

        analysis = AIAnalysis(
            **body.model_dump()
        )

        db.add(analysis)



    # update document status

    document.status = "classified"



    create_audit_log(

        db=db,

        event_type="ai_analysis_completed",

        action="AI analysis saved by Lambda service",

        document_id=document.id,

        user_id=None,

        organization_id=document.recipient_org_id,

        details={
            "source": "lambda",
            "model": body.model_used
        }

    )


    db.commit()

    db.refresh(analysis)


    return analysis