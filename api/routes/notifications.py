from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from uuid import UUID

from pydantic import BaseModel

from database import get_db

from models.notification import Notification
from models.document import Document
from models.organization import Organization

from schemas.notification import NotificationResponse

from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==================================================
# Response Schema
# ==================================================

class MessageResponse(BaseModel):
    message: str


# ==================================================
# GET ALL NOTIFICATIONS
# GET /notifications
# ==================================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    notifications = (
        db.query(
            Notification,
            Document.document_type,
            Document.subject.label("document_subject"),
            Organization.name.label("sender_org_name"),
        )
        .outerjoin(
            Document,
            Notification.document_id == Document.id,
        )
        .outerjoin(
            Organization,
            Document.sender_org_id == Organization.id,
        )
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


    return [
        {
            **{
                key: value
                for key, value in notification.__dict__.items()
                if key != "_sa_instance_state"
            },
            "document_type": document_type,
            "document_subject": document_subject,
            "sender_org_name": sender_org_name,
        }
        for (
            notification,
            document_type,
            document_subject,
            sender_org_name,
        ) in notifications
    ]


# ==================================================
# MARK ALL NOTIFICATIONS READ
# PUT /notifications/read-all
# ==================================================

@router.put(
    "/read-all",
    response_model=MessageResponse
)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .update(
            {"is_read": True}
        )
    )

    db.commit()

    return {
        "message": "all notifications marked read"
    }


# ==================================================
# MARK ONE NOTIFICATION READ
# PUT /notifications/{notification_id}/read
# ==================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )


    notification.is_read = True

    db.commit()


    notification_data = (
        db.query(
            Notification,
            Document.document_type,
            Document.subject.label("document_subject"),
            Organization.name.label("sender_org_name"),
        )
        .outerjoin(
            Document,
            Notification.document_id == Document.id,
        )
        .outerjoin(
            Organization,
            Document.sender_org_id == Organization.id,
        )
        .filter(
            Notification.id == notification_id
        )
        .first()
    )


    notification, document_type, document_subject, sender_org_name = notification_data


    return {
        **{
            key: value
            for key, value in notification.__dict__.items()
            if key != "_sa_instance_state"
        },
        "document_type": document_type,
        "document_subject": document_subject,
        "sender_org_name": sender_org_name,
    }


# ==================================================
# DELETE NOTIFICATION
# DELETE /notifications/{notification_id}
# ==================================================

@router.delete(
    "/{notification_id}",
    response_model=MessageResponse
)
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )


    db.delete(notification)

    db.commit()


    return {
        "message": "notification dismissed"
    }