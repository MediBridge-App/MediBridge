from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from models.webhook import Webhook

from schemas.webhook import (
    WebhookCreate,
    WebhookResponse
)


router = APIRouter(
    prefix="/settings/webhooks",
    tags=["Webhooks"]
)



# ==================================================
# GET WEBHOOKS
# GET /settings/webhooks
# ==================================================

@router.get(
    "",
    response_model=list[WebhookResponse]
)
def get_webhooks(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    return (
        db.query(Webhook)
        .filter(
            Webhook.organization_id == current_org_id
        )
        .all()
    )



# ==================================================
# CREATE WEBHOOK
# POST /settings/webhooks
# ==================================================

@router.post(
    "",
    response_model=WebhookResponse
)
def create_webhook(
    body: WebhookCreate,
    db: Session = Depends(get_db)
):

    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    webhook = Webhook(

        organization_id=current_org_id,

        name=body.name,

        url=body.url,

        events=body.events
    )


    db.add(webhook)

    db.commit()

    db.refresh(webhook)


    return webhook



# ==================================================
# DELETE WEBHOOK
# DELETE /settings/webhooks/{id}
# ==================================================

@router.delete(
    "/{webhook_id}"
)
def delete_webhook(
    webhook_id: UUID,
    db: Session = Depends(get_db)
):

    webhook = (
        db.query(Webhook)
        .filter(
            Webhook.id == webhook_id
        )
        .first()
    )


    if not webhook:
        raise HTTPException(
            status_code=404,
            detail="Webhook not found"
        )


    webhook.is_active = False


    db.commit()


    return {
        "message": "webhook removed"
    }