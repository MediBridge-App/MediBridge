import hashlib
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import Request

from models.audit import AuditLog


def make_json_serializable(value):
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, dict):
        return {
            key: make_json_serializable(val)
            for key, val in value.items()
        }

    if isinstance(value, list):
        return [
            make_json_serializable(item)
            for item in value
        ]

    return value

def create_audit_log(
    db,
    event_type: str,
    action: str,
    document_id=None,
    user_id=None,
    organization_id=None,
    details=None,
    request: Request = None,
):
    created_at = datetime.now(timezone.utc)

    ip_address = None
    if request and request.client:
        ip_address = request.client.host

    hash_source = (
        f"{event_type}"
        f"{action}"
        f"{document_id}"
        f"{user_id}"
        f"{organization_id}"
        f"{created_at.isoformat()}"
    )

    audit_hash = hashlib.sha256(
        hash_source.encode()
    ).hexdigest()

    audit = AuditLog(
        event_id=f"EVT-{uuid.uuid4().hex[:6].upper()}",
        document_id=document_id,
        user_id=user_id,
        organization_id=organization_id,
        event_type=event_type,
        action=action,
        details=make_json_serializable(details),
        ip_address=ip_address,
        hash=audit_hash,
        created_at=created_at,
    )

    db.add(audit)
    db.flush()

    return audit