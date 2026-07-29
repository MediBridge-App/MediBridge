import os
import requests

from dotenv import load_dotenv
from jose import jwt, JWTError

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from database import get_db
from models.user import User


load_dotenv()


AWS_REGION = os.getenv("AWS_REGION")

COGNITO_USER_POOL_ID = os.getenv(
    "COGNITO_USER_POOL_ID"
)

COGNITO_CLIENT_ID = os.getenv(
    "COGNITO_CLIENT_ID"
)


COGNITO_ISSUER = (
    f"https://cognito-idp.{AWS_REGION}.amazonaws.com/"
    f"{COGNITO_USER_POOL_ID}"
)


security = HTTPBearer()



# =====================================
# Get Cognito JWKS keys
# =====================================

def get_jwks():

    url = (
        f"{COGNITO_ISSUER}/"
        ".well-known/jwks.json"
    )

    response = requests.get(url)

    response.raise_for_status()

    return response.json()



# =====================================
# Verify Cognito JWT
# =====================================

def verify_token(token: str):

    try:

        jwks = get_jwks()


        headers = jwt.get_unverified_header(
            token
        )


        rsa_key = None


        for key in jwks["keys"]:

            if key["kid"] == headers["kid"]:

                rsa_key = key
                break


        if not rsa_key:

            raise HTTPException(
                status_code=401,
                detail="Public key not found"
            )


        payload = jwt.decode(

            token,

            rsa_key,

            algorithms=["RS256"],

            audience=COGNITO_CLIENT_ID,

            issuer=COGNITO_ISSUER,

        )


        # Ensure this is an ACCESS token
        if payload.get("token_use") != "access":

            raise HTTPException(
                status_code=401,
                detail="Access token required"
            )


        return payload



    except JWTError as e:

        print("JWT ERROR:", str(e))

        raise HTTPException(
            status_code=401,
            detail=f"JWT validation failed: {str(e)}"
        )


    except Exception as e:

        print("AUTH ERROR:", str(e))

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )



# =====================================
# FastAPI Authentication Dependency
# =====================================

def get_current_user(

    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)

):

    token = credentials.credentials


    payload = verify_token(token)


    cognito_id = payload.get("sub")


    if not cognito_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )


    user = (
        db.query(User)
        .filter(User.cognito_id == cognito_id)
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return user