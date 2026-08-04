from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.webhook import Webhook
from schemas.webhook import WebhookCreate, WebhookResponse

router = APIRouter(prefix="/settings/webhooks", tags=["Webhooks"])


# ==================================================
# GET WEBHOOKS
# GET /settings/webhooks
# ==================================================


@router.get("", response_model=list[WebhookResponse])
def get_webhooks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    user = current_user

    return (
        db.query(Webhook).filter(Webhook.organization_id == user.organization_id).all()
    )


# ==================================================
# CREATE WEBHOOK
# POST /settings/webhooks
# ==================================================


@router.post("", response_model=WebhookResponse)
def create_webhook(
    body: WebhookCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user = current_user

    webhook = Webhook(
        organization_id=user.organization_id,
        name=body.name,
        url=body.url,
        events=body.events,
    )

    db.add(webhook)

    db.commit()

    db.refresh(webhook)

    return webhook


# ==================================================
# DELETE WEBHOOK
# DELETE /settings/webhooks/{id}
# ==================================================


@router.delete("/{webhook_id}")
def delete_webhook(
    webhook_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user = current_user

    webhook = (
        db.query(Webhook)
        .filter(
            Webhook.id == webhook_id, Webhook.organization_id == user.organization_id
        )
        .first()
    )

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    webhook.is_active = False

    db.commit()

    return {"message": "webhook removed"}
