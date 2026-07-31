import uuid
from datetime import datetime

from models.audit import AuditLog


def create_audit_log(
    db,
    event_type: str,
    action: str,
    document_id=None,
    user_id=None,
    organization_id=None,
    details=None
):

    audit = AuditLog(

        event_id=f"EVT-{uuid.uuid4().hex[:6].upper()}",

        document_id=document_id,

        user_id=user_id,

        organization_id=organization_id,

        event_type=event_type,

        action=action,

        details=details,

        created_at=datetime.utcnow()
    )

    db.add(audit)

    return audit