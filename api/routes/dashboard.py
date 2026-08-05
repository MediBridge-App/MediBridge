from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.document import Document

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ==================================================
# Helpers
# ==================================================
def calculate_change(current: int, previous: int) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


# ==================================================
# Dashboard Stats
# ==================================================
@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    org_id = current_user.organization_id

    now = datetime.now(timezone.utc)
    current_start = now - timedelta(days=7)
    previous_start = now - timedelta(days=14)

    # ----------------------------------------
    # Single aggregated query (FAST 🚀)
    # ----------------------------------------
    stats = db.query(
        # totals
        func.count(case((Document.sender_org_id == org_id, 1))).label("sent"),
        func.count(case((Document.recipient_org_id == org_id, 1))).label("received"),
        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (Document.status != "delivered"),
                    1,
                )
            )
        ).label("pending"),
        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (
                        Document.status.in_(
                            ["ocr_complete", "classified", "routed", "delivered"]
                        )
                    ),
                    1,
                )
            )
        ).label("ai_processed"),

        # current period
        func.count(
            case(
                (
                    (Document.sender_org_id == org_id)
                    & (Document.created_at >= current_start),
                    1,
                )
            )
        ).label("sent_current"),
        func.count(
            case(
                (
                    (Document.sender_org_id == org_id)
                    & (Document.created_at >= previous_start)
                    & (Document.created_at < current_start),
                    1,
                )
            )
        ).label("sent_previous"),

        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (Document.created_at >= current_start),
                    1,
                )
            )
        ).label("received_current"),
        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (Document.created_at >= previous_start)
                    & (Document.created_at < current_start),
                    1,
                )
            )
        ).label("received_previous"),

        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (Document.status != "delivered")
                    & (Document.created_at >= current_start),
                    1,
                )
            )
        ).label("pending_current"),
        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (Document.status != "delivered")
                    & (Document.created_at >= previous_start)
                    & (Document.created_at < current_start),
                    1,
                )
            )
        ).label("pending_previous"),

        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (
                        Document.status.in_(
                            ["ocr_complete", "classified", "routed", "delivered"]
                        )
                    )
                    & (Document.created_at >= current_start),
                    1,
                )
            )
        ).label("ai_current"),
        func.count(
            case(
                (
                    (Document.recipient_org_id == org_id)
                    & (
                        Document.status.in_(
                            ["ocr_complete", "classified", "routed", "delivered"]
                        )
                    )
                    & (Document.created_at >= previous_start)
                    & (Document.created_at < current_start),
                    1,
                )
            )
        ).label("ai_previous"),
    ).one()

    return {
        "documents_sent": stats.sent,
        "documents_received": stats.received,
        "pending_review": stats.pending,
        "ai_processed": stats.ai_processed,
        "sent_change_pct": calculate_change(stats.sent_current, stats.sent_previous),
        "received_change_pct": calculate_change(
            stats.received_current, stats.received_previous
        ),
        "pending_change_pct": calculate_change(
            stats.pending_current, stats.pending_previous
        ),
        "ai_change_pct": calculate_change(stats.ai_current, stats.ai_previous),
    }


# ==================================================
# Recent Activity
# ==================================================
@router.get("/activity")
def dashboard_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    org_id = current_user.organization_id

    documents = (
        db.query(Document)
        .filter(
            or_(
                Document.sender_org_id == org_id,
                Document.recipient_org_id == org_id,
            )
        )
        .order_by(Document.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "date": doc.created_at,
            "document_id": doc.id,
            "subject": doc.subject,
            "status": doc.status,
        }
        for doc in documents
    ]


# ==================================================
# Document Types
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
        .filter(Document.recipient_org_id == current_user.organization_id)
        .group_by(Document.document_type)
        .all()
    )

    return [
        {"type": row[0], "count": row[1]}
        for row in results
    ]


# ==================================================
# Recent Documents
# ==================================================
@router.get("/recent")
def recent_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    org_id = current_user.organization_id

    documents = (
        db.query(Document)
        .filter(
            or_(
                Document.sender_org_id == org_id,
                Document.recipient_org_id == org_id,
            )
        )
        .order_by(Document.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": doc.id,
            "subject": doc.subject,
            "status": doc.status,
            "created_at": doc.created_at,
        }
        for doc in documents
    ]