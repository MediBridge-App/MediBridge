from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from models.security_settings import SecuritySettings

from schemas.security_settings import (
    SecuritySettingsResponse,
    SecuritySettingsUpdate
)


router = APIRouter(
    prefix="/security",
    tags=["Security"]
)



# ==================================================
# GET SECURITY SETTINGS
# GET /security/settings
# ==================================================

@router.get(
    "/settings",
    response_model=SecuritySettingsResponse
)
def get_security_settings(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    settings = (
        db.query(SecuritySettings)
        .filter(
            SecuritySettings.organization_id == current_org_id
        )
        .first()
    )


    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Security settings not found"
        )


    return settings




# ==================================================
# UPDATE SECURITY SETTINGS
# PUT /security/settings
# ==================================================

@router.put(
    "/settings",
    response_model=SecuritySettingsResponse
)
def update_security_settings(
    body: SecuritySettingsUpdate,
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    settings = (
        db.query(SecuritySettings)
        .filter(
            SecuritySettings.organization_id == current_org_id
        )
        .first()
    )


    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Security settings not found"
        )


    if body.mfa_enabled is not None:
        settings.mfa_enabled = body.mfa_enabled


    if body.ip_allowlisting_enabled is not None:
        settings.ip_allowlisting_enabled = body.ip_allowlisting_enabled


    if body.session_timeout_minutes is not None:

        allowed_values = [
            15,
            30,
            60
        ]

        if body.session_timeout_minutes not in allowed_values:
            raise HTTPException(
                status_code=400,
                detail="Invalid session timeout"
            )

        settings.session_timeout_minutes = (
            body.session_timeout_minutes
        )


    db.commit()

    db.refresh(settings)


    return settings