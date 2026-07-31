from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from dependencies.auth import get_current_user

from models.user import User

from schemas.user import (
    UserResponse,
    UserRoleUpdate,
    UserStatusUpdate
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)



# ==================================================
# GET ALL USERS IN ORGANIZATION
# GET /users
# ==================================================

@router.get(
    "",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    user = current_user


    users = (
        db.query(User)
        .filter(
            User.organization_id == user.organization_id
        )
        .all()
    )


    return users



# ==================================================
# UPDATE USER ROLE
# PUT /users/{user_id}/role
# ==================================================

@router.put(
    "/{user_id}/role",
    response_model=UserResponse
)
def update_user_role(
    user_id: UUID,
    body: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    user = current_user


    target_user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.organization_id == user.organization_id
        )
        .first()
    )


    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    allowed_roles = [
        "organization_admin",
        "provider",
        "registered_nurse",
        "referral_coordinator",
        "medical_assistant"
    ]


    if body.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )


    target_user.role = body.role


    db.commit()
    db.refresh(target_user)


    return target_user



# ==================================================
# UPDATE USER STATUS
# PUT /users/{user_id}/status
# ==================================================

@router.put(
    "/{user_id}/status",
    response_model=UserResponse
)
def update_user_status(
    user_id: UUID,
    body: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    user = current_user


    target_user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.organization_id == user.organization_id
        )
        .first()
    )


    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    target_user.is_active = body.is_active


    db.commit()
    db.refresh(target_user)


    return target_user