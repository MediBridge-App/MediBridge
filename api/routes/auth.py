import os
import boto3

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db

from models.user import User

from schemas.auth import (
    LoginRequest,
    TokenResponse
)

from dependencies.auth import (
    get_current_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


cognito_client = boto3.client(
    "cognito-idp",
    region_name=os.getenv(
        "AWS_REGION"
    )
)



# =====================================
# LOGIN
# POST /auth/login
# =====================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    user: LoginRequest,
    db: Session = Depends(get_db)
):

    try:

        response = cognito_client.initiate_auth(

            ClientId=os.getenv(
                "COGNITO_CLIENT_ID"
            ),

            AuthFlow="USER_PASSWORD_AUTH",

            AuthParameters={
                "USERNAME": user.email,
                "PASSWORD": user.password
            }
        )


        auth = response["AuthenticationResult"]


        db_user = (
            db.query(User)
            .filter(
                User.email == user.email
            )
            .first()
        )


        if not db_user:

            raise HTTPException(
                status_code=404,
                detail="User not found in database"
            )


        return {

            "access_token": auth["AccessToken"],

            "id_token": auth["IdToken"],

            "refresh_token": auth.get(
                "RefreshToken"
            ),

            "token_type": "bearer",

            "user": {

                "id": str(db_user.id),

                "full_name": db_user.full_name,

                "email": db_user.email,

                "role": db_user.role,

                "specialty": db_user.specialty,

                "npi_number": db_user.npi_number,

                "organization_id": str(
                    db_user.organization_id
                ),

                "organization_name": (
                    db_user.organization.name
                    if db_user.organization
                    else None
                ),

                "org_code": (
                    db_user.organization.org_code
                    if db_user.organization
                    else None
                ),

                "last_login": db_user.last_login

            }

        }



    except cognito_client.exceptions.NotAuthorizedException:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )



    except cognito_client.exceptions.UserNotFoundException:

        raise HTTPException(
            status_code=401,
            detail="User does not exist"
        )



    except Exception as e:

        print(
            "COGNITO LOGIN ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Authentication failed"
        )





# =====================================
# LOGOUT
# POST /auth/logout
# =====================================

@router.post(
    "/logout"
)
def logout():

    return {
        "message": "Logged out"
    }





# =====================================
# CURRENT USER
# GET /auth/me
# =====================================

@router.get(
    "/me"
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {

        "id": str(current_user.id),

        "full_name": current_user.full_name,

        "email": current_user.email,

        "role": current_user.role,

        "specialty": current_user.specialty,

        "npi_number": current_user.npi_number,

        "organization_id": str(
            current_user.organization_id
        ),

        "organization_name": (
            current_user.organization.name
            if current_user.organization
            else None
        ),

        "org_code": (
            current_user.organization.org_code
            if current_user.organization
            else None
        ),

        "last_login": current_user.last_login

    }