from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db

from models.user_notification_preferences import (
    UserNotificationPreferences
)

from schemas.user_notification_preferences import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate
)


router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


# ==================================================
# GET USER NOTIFICATION PREFERENCES
# GET /settings/notifications
# ==================================================

@router.get(
    "/notifications",
    response_model=NotificationPreferencesResponse
)
def get_notification_preferences(
    db: Session = Depends(get_db)
):

    # Temporary until authentication/JWT
    current_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    preferences = (
        db.query(UserNotificationPreferences)
        .filter(
            UserNotificationPreferences.user_id == current_user_id
        )
        .first()
    )


    if not preferences:
        raise HTTPException(
            status_code=404,
            detail="Notification preferences not found"
        )


    return preferences



# ==================================================
# UPDATE USER NOTIFICATION PREFERENCES
# PUT /settings/notifications
# ==================================================

@router.put(
    "/notifications",
    response_model=NotificationPreferencesResponse
)
def update_notification_preferences(
    body: NotificationPreferencesUpdate,
    db: Session = Depends(get_db)
):

    # Temporary until authentication/JWT
    current_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    preferences = (
        db.query(UserNotificationPreferences)
        .filter(
            UserNotificationPreferences.user_id == current_user_id
        )
        .first()
    )


    if not preferences:
        raise HTTPException(
            status_code=404,
            detail="Notification preferences not found"
        )


    if body.document_delivered is not None:
        preferences.document_delivered = body.document_delivered


    if body.document_read is not None:
        preferences.document_read = body.document_read


    if body.urgent_documents is not None:
        preferences.urgent_documents = body.urgent_documents


    if body.audit_events is not None:
        preferences.audit_events = body.audit_events


    if body.ai_processing_complete is not None:
        preferences.ai_processing_complete = body.ai_processing_complete


    preferences.updated_at = datetime.utcnow()


    db.commit()

    db.refresh(preferences)


    return preferences