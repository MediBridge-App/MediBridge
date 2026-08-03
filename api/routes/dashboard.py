from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db

from dependencies.auth import get_current_user

from models.document import Document

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ==================================================
# Dashboard Stats
# GET /dashboard/stats
# ==================================================


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    org_id = current_user.organization_id

    documents_sent = db.query(Document).filter(Document.sender_org_id == org_id).count()

    documents_received = (
        db.query(Document).filter(Document.recipient_org_id == org_id).count()
    )

    pending_review = (
        db.query(Document)
        .filter(Document.recipient_org_id == org_id, Document.status != "delivered")
        .count()
    )

    ai_processed = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status.in_(["ocr_complete", "classified", "routed", "delivered"]),
        )
        .count()
    )

    return {
        "documents_sent": documents_sent,
        "documents_received": documents_received,
        "pending_review": pending_review,
        "ai_processed": ai_processed,
        "sent_change_pct": 0,
        "received_change_pct": 0,
        "pending_change_pct": 0,
        "ai_change_pct": 0,
    }


# ==================================================
# Recent Activity
# GET /dashboard/activity
# ==================================================


@router.get("/activity")
def dashboard_activity(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            (
                (Document.sender_org_id == current_user.organization_id)
                | (Document.recipient_org_id == current_user.organization_id)
            )
        )
        .order_by(Document.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "date": document.created_at,
            "document_id": document.id,
            "subject": document.subject,
            "status": document.status,
        }
        for document in documents
    ]


# ==================================================
# Document Types
# GET /dashboard/document-types
# ==================================================


@router.get("/document-types")
def document_types(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    results = (
        db.query(Document.document_type, func.count(Document.id))
        .filter(Document.recipient_org_id == current_user.organization_id)
        .group_by(Document.document_type)
        .all()
    )

    return [{"type": item[0], "count": item[1]} for item in results]


# ==================================================
# Recent Documents
# GET /dashboard/recent
# ==================================================


@router.get("/recent")
def recent_documents(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            (
                (Document.sender_org_id == current_user.organization_id)
                | (Document.recipient_org_id == current_user.organization_id)
            )
        )
        .order_by(Document.created_at.desc())
        .limit(10)
        .all()
    )

    return documents
