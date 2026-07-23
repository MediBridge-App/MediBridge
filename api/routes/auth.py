from fastapi import APIRouter

from schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# POST /auth/login
# ==========================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    user: LoginRequest
):

    # Temporary authentication
    return {
        "access_token": "fake-token",
        "token_type": "bearer",
        "user": {
            "id": "11111111-1111-1111-1111-111111111111",
            "email": user.email,
            "full_name": "Test User",
            "role": "provider",
            "organization_id": "22222222-2222-2222-2222-222222222222"
        }
    }



# ==========================================
# POST /auth/logout
# ==========================================

@router.post("/logout")
def logout():

    return {
        "message": "Logged out"
    }



# ==========================================
# GET /auth/me
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_current_user():

    return {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "test@medibridge.com",
        "full_name": "Test User",
        "role": "provider",
        "organization_id": "22222222-2222-2222-2222-222222222222"
    }