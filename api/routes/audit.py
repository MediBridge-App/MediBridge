import csv
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.audit import AuditLog
from models.document import Document
from models.organization import Organization
from models.user import User
from schemas.audit import AuditResponse

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


# ==================================================
# GET ALL AUDIT EVENTS
# GET /audit
# ==================================================

@router.get("", response_model=list[AuditResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    logs = (
        db.query(
            AuditLog,
            User.full_name.label("user_name"),
            Organization.name.label("org_name"),
            Document.tx_ref.label("tx_ref"),
        )
        .outerjoin(
            User,
            AuditLog.user_id == User.id,
        )
        .outerjoin(
            Organization,
            AuditLog.organization_id == Organization.id,
        )
        .outerjoin(
            Document,
            AuditLog.document_id == Document.id,
        )
        .filter(
            AuditLog.organization_id == current_user.organization_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )

    return [
        {
            **{
                key: value
                for key, value in log.__dict__.items()
                if key != "_sa_instance_state"
            },
            "user_name": user_name,
            "org_name": org_name,
            "tx_ref": tx_ref or "TX-UNKNOWN",
        }
        for (
            log,
            user_name,
            org_name,
            tx_ref,
        ) in logs
    ]


# ==================================================
# EXPORT AUDIT CSV
# GET /audit/export
# ==================================================

@router.get("/export")
def export_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    logs = (
        db.query(
            AuditLog,
            Document.tx_ref.label("tx_ref"),
        )
        .outerjoin(
            Document,
            AuditLog.document_id == Document.id,
        )
        .filter(
            AuditLog.organization_id == current_user.organization_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow(
        [
            "event_id",
            "event_type",
            "action",
            "tx_ref",
            "user_id",
            "organization_id",
            "ip_address",
            "hash",
            "created_at",
        ]
    )

    for log, tx_ref in logs:
        writer.writerow(
            [
                log.event_id,
                log.event_type,
                log.action,
                tx_ref or "",
                str(log.user_id) if log.user_id else "",
                str(log.organization_id)
                if log.organization_id
                else "",
                log.ip_address or "",
                log.hash or "",
                log.created_at,
            ]
        )

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; filename=audit_logs.csv"
            )
        },
    )


# ==================================================
# GET SINGLE AUDIT EVENT
# GET /audit/{event_id}
# ==================================================

@router.get("/{event_id}", response_model=AuditResponse)
def get_audit_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    audit = (
        db.query(
            AuditLog,
            User.full_name.label("user_name"),
            Organization.name.label("org_name"),
            Document.tx_ref.label("tx_ref"),
        )
        .outerjoin(
            User,
            AuditLog.user_id == User.id,
        )
        .outerjoin(
            Organization,
            AuditLog.organization_id == Organization.id,
        )
        .outerjoin(
            Document,
            AuditLog.document_id == Document.id,
        )
        .filter(
            AuditLog.event_id == event_id,
            AuditLog.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=404,
            detail="Audit event not found",
        )

    log, user_name, org_name, tx_ref = audit

    return {
        **{
            key: value
            for key, value in log.__dict__.items()
            if key != "_sa_instance_state"
        },
        "user_name": user_name,
        "org_name": org_name,
        "tx_ref": tx_ref or "TX-UNKNOWN",
    }