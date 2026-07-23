from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from io import StringIO
import csv

from database import get_db
from models.audit import AuditLog
from schemas.audit import AuditResponse


router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)


# =====================================
# GET ALL AUDIT EVENTS
# GET /audit
# =====================================

@router.get(
    "",
    response_model=list[AuditResponse]
)
def get_audit_logs(
    db: Session = Depends(get_db)
):

    logs = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )

    return logs



# =====================================
# GET SINGLE AUDIT EVENT
# GET /audit/{event_id}
# =====================================

@router.get(
    "/{event_id}",
    response_model=AuditResponse
)
def get_audit_event(
    event_id: str,
    db: Session = Depends(get_db)
):

    audit = (
        db.query(AuditLog)
        .filter(
            AuditLog.event_id == event_id
        )
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=404,
            detail="Audit event not found"
        )

    return audit



# =====================================
# EXPORT AUDIT CSV
# GET /audit/export
# =====================================

@router.get("/export")
def export_audit_logs(
    db: Session = Depends(get_db)
):

    logs = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )


    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "event_id",
        "event_type",
        "action",
        "document_id",
        "user_id",
        "organization_id",
        "ip_address",
        "created_at"
    ])


    for log in logs:

        writer.writerow([
            log.event_id,
            log.event_type,
            log.action,
            log.document_id,
            log.user_id,
            log.organization_id,
            log.ip_address,
            log.created_at
        ])


    output.seek(0)


    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=audit_logs.csv"
        }
    )