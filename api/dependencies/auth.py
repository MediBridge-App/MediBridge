from fastapi import Header, HTTPException


def get_current_user(
    authorization: str = Header(...)
):

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication header"
        )

    token = authorization.replace("Bearer ", "")

    # TEMPORARY
    # Later:
    # Cognito JWT verification happens here

    return {
        "id": "temporary-user-id",
        "email": "test@medibridge.com",
        "role": "provider",
        "organization_id": "temporary-org-id",
        "token": token
    }