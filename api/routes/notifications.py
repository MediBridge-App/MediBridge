from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.notification import Notification

from schemas.notification import NotificationResponse


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)



# ==================================================
# GET NOTIFICATIONS
# GET /notifications
# ==================================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


    return notifications




# ==================================================
# MARK ONE NOTIFICATION READ
# PUT /notifications/{id}/read
# ==================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
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
    db.refresh(notification)


    return notification




# ==================================================
# MARK ALL READ
# PUT /notifications/read-all
# ==================================================

@router.put(
    "/read-all"
)
def mark_all_read(
    db: Session = Depends(get_db)
):

    current_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user_id
        )
        .update(
            {
                "is_read": True
            }
        )
    )


    db.commit()


    return {
        "message": "all marked read"
    }




# ==================================================
# DELETE NOTIFICATION
# DELETE /notifications/{id}
# ==================================================

@router.delete(
    "/{notification_id}"
)
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
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
        "message": "dismissed"
    }