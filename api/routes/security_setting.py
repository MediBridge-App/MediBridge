from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.security_settings import SecuritySettings
from models.user import User
from schemas.security_settings import SecuritySettingsResponse, SecuritySettingsUpdate

router = APIRouter(prefix="/security", tags=["Security"])


# ==================================================
# GET SECURITY SETTINGS
# GET /security/settings
# ==================================================


@router.get("/settings", response_model=SecuritySettingsResponse)
def get_security_settings(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):

    settings = (
        db.query(SecuritySettings)
        .filter(SecuritySettings.organization_id == current_user.organization_id)
        .first()
    )

    if not settings:

        raise HTTPException(status_code=404, detail="Security settings not found")

    return settings


# ==================================================
# UPDATE SECURITY SETTINGS
# PUT /security/settings
# ==================================================


@router.put("/settings", response_model=SecuritySettingsResponse)
def update_security_settings(
    body: SecuritySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    settings = (
        db.query(SecuritySettings)
        .filter(SecuritySettings.organization_id == current_user.organization_id)
        .first()
    )

    if not settings:

        raise HTTPException(status_code=404, detail="Security settings not found")

    if body.mfa_enabled is not None:

        settings.mfa_enabled = body.mfa_enabled

    if body.ip_allowlisting_enabled is not None:

        settings.ip_allowlisting_enabled = body.ip_allowlisting_enabled

    if body.session_timeout_minutes is not None:

        allowed_values = [15, 30, 60]

        if body.session_timeout_minutes not in allowed_values:

            raise HTTPException(status_code=400, detail="Invalid session timeout")

        settings.session_timeout_minutes = body.session_timeout_minutes

    db.commit()

    db.refresh(settings)

    return settings
