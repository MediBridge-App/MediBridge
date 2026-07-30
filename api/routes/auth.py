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


        auth = response[
            "AuthenticationResult"
        ]


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

            "user": db_user

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
    current_user = Depends(
        get_current_user
    )
):

    return {

        "user": current_user

    }