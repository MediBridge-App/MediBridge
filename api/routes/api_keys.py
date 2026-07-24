from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import secrets
import hashlib

from database import get_db

from models.api_key import APIKey

from schemas.api_key import (
    APIKeyCreate,
    APIKeyResponse,
    APIKeyCreatedResponse
)


router = APIRouter(
    prefix="/settings/api-keys",
    tags=["API Keys"]
)



# ==================================================
# GET API KEYS
# GET /settings/api-keys
# ==================================================

@router.get(
    "",
    response_model=list[APIKeyResponse]
)
def get_api_keys(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    return (
        db.query(APIKey)
        .filter(
            APIKey.organization_id == current_org_id
        )
        .all()
    )



# ==================================================
# CREATE API KEY
# POST /settings/api-keys
# ==================================================

@router.post(
    "",
    response_model=APIKeyCreatedResponse
)
def create_api_key(
    body: APIKeyCreate,
    db: Session = Depends(get_db)
):

    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )


    raw_key = (
        "mb_prod_"
        + secrets.token_hex(16)
    )


    key_hash = hashlib.sha256(
        raw_key.encode()
    ).hexdigest()


    new_key = APIKey(

        organization_id=current_org_id,

        name=body.name,

        key_prefix="mb_prod_",

        key_hash=key_hash
    )


    db.add(new_key)

    db.commit()

    db.refresh(new_key)


    return {
        "id": new_key.id,
        "name": new_key.name,
        "key": raw_key,
        "created_at": new_key.created_at
    }



# ==================================================
# DELETE API KEY
# DELETE /settings/api-keys/{id}
# ==================================================

@router.delete(
    "/{key_id}"
)
def delete_api_key(
    key_id: UUID,
    db: Session = Depends(get_db)
):

    api_key = (
        db.query(APIKey)
        .filter(
            APIKey.id == key_id
        )
        .first()
    )


    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found"
        )


    api_key.is_active = False


    db.commit()


    return {
        "message": "key revoked"
    }