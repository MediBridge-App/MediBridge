from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.document import Document


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =====================================
# Dashboard Stats
# GET /dashboard/stats
# =====================================

@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    sent = db.query(Document).count()

    received = db.query(Document).filter(
        Document.status == "delivered"
    ).count()

    pending = db.query(Document).filter(
        Document.status != "delivered"
    ).count()


    return {
        "documents_sent": sent,
        "documents_received": received,
        "pending_review": pending,
        "ai_processed": 0,

        "sent_change_pct": 0,
        "received_change_pct": 0,
        "pending_change_pct": 0,
        "ai_change_pct": 0
    }



# =====================================
# Recent Activity
# GET /dashboard/activity
# =====================================

@router.get("/activity")
def dashboard_activity(
    db: Session = Depends(get_db)
):

    return [
        {
            "day": "Mon",
            "sent": 0,
            "received": 0
        },
        {
            "day": "Tue",
            "sent": 0,
            "received": 0
        }
    ]



# =====================================
# Document Types
# GET /dashboard/document-types
# =====================================

@router.get("/document-types")
def document_types(
    db: Session = Depends(get_db)
):

    rresults = (
    db.query(
        Document.document_type,
        func.count(Document.id)
    )
    .filter(Document.document_type.isnot(None))  
    .group_by(
        Document.document_type
    )
    .all()
)


    return [
        {
            "type": item[0],
            "count": item[1]
        }
        for item in results
    ]



# =====================================
# Recent Documents
# GET /dashboard/recent
# =====================================

@router.get("/recent")
def recent_documents(
    db: Session = Depends(get_db)
):

    documents = (
        db.query(Document)
        .order_by(
            Document.created_at.desc()
        )
        .limit(10)
        .all()
    )


    return documents