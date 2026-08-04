from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.document import Document

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def calculate_change(current, previous):
    if previous == 0:
        return 100 if current > 0 else 0

    return round(((current - previous) / previous) * 100, 1)


# ==================================================
# Dashboard Stats
# GET /dashboard/stats
# ==================================================


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    org_id = current_user.organization_id

    now = datetime.now(timezone.utc)

    current_period_start = now - timedelta(days=7)
    previous_period_start = now - timedelta(days=14)


    documents_sent = (
        db.query(Document)
        .filter(Document.sender_org_id == org_id)
        .count()
    )


    documents_received = (
        db.query(Document)
        .filter(Document.recipient_org_id == org_id)
        .count()
    )


    pending_review = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status != "delivered",
        )
        .count()
    )


    ai_processed = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status.in_(
                [
                    "ocr_complete",
                    "classified",
                    "routed",
                    "delivered",
                ]
            ),
        )
        .count()
    )


    # -------------------------------
    # Change percentages
    # Current 7 days vs previous 7 days
    # -------------------------------


    sent_current = (
        db.query(Document)
        .filter(
            Document.sender_org_id == org_id,
            Document.created_at >= current_period_start,
        )
        .count()
    )


    sent_previous = (
        db.query(Document)
        .filter(
            Document.sender_org_id == org_id,
            Document.created_at >= previous_period_start,
            Document.created_at < current_period_start,
        )
        .count()
    )


    received_current = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.created_at >= current_period_start,
        )
        .count()
    )


    received_previous = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.created_at >= previous_period_start,
            Document.created_at < current_period_start,
        )
        .count()
    )


    pending_current = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status != "delivered",
            Document.created_at >= current_period_start,
        )
        .count()
    )


    pending_previous = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status != "delivered",
            Document.created_at >= previous_period_start,
            Document.created_at < current_period_start,
        )
        .count()
    )


    ai_current = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status.in_(
                [
                    "ocr_complete",
                    "classified",
                    "routed",
                    "delivered",
                ]
            ),
            Document.created_at >= current_period_start,
        )
        .count()
    )


    ai_previous = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == org_id,
            Document.status.in_(
                [
                    "ocr_complete",
                    "classified",
                    "routed",
                    "delivered",
                ]
            ),
            Document.created_at >= previous_period_start,
            Document.created_at < current_period_start,
        )
        .count()
    )


    return {
        "documents_sent": documents_sent,
        "documents_received": documents_received,
        "pending_review": pending_review,
        "ai_processed": ai_processed,

        "sent_change_pct": calculate_change(
            sent_current,
            sent_previous,
        ),

        "received_change_pct": calculate_change(
            received_current,
            received_previous,
        ),

        "pending_change_pct": calculate_change(
            pending_current,
            pending_previous,
        ),

        "ai_change_pct": calculate_change(
            ai_current,
            ai_previous,
        ),
    }



# ==================================================
# Recent Activity
# GET /dashboard/activity
# ==================================================


@router.get("/activity")
def dashboard_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    documents = (
        db.query(Document)
        .filter(
            
                (Document.sender_org_id == current_user.organization_id)
                |
                (Document.recipient_org_id == current_user.organization_id)
            
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
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    results = (
        db.query(
            Document.document_type,
            func.count(Document.id),
        )
        .filter(
            Document.recipient_org_id == current_user.organization_id
        )
        .group_by(Document.document_type)
        .all()
    )


    return [
        {
            "type": item[0],
            "count": item[1],
        }
        for item in results
    ]



# ==================================================
# Recent Documents
# GET /dashboard/recent
# ==================================================


@router.get("/recent")
def recent_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    documents = (
        db.query(Document)
        .filter(
            
                (Document.sender_org_id == current_user.organization_id)
                |
                (Document.recipient_org_id == current_user.organization_id)
            
        )
        .order_by(Document.created_at.desc())
        .limit(10)
        .all()
    )


    return documents