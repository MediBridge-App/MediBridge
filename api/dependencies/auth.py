import os

import requests
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.user import User

load_dotenv()


AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")


if not AWS_REGION:
    raise Exception("AWS_REGION missing")


if not COGNITO_USER_POOL_ID:
    raise Exception("COGNITO_USER_POOL_ID missing")


if not COGNITO_CLIENT_ID:
    raise Exception("COGNITO_CLIENT_ID missing")


COGNITO_ISSUER = (
    f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
)


security = HTTPBearer()


# ==================================================
# Get Cognito JWKS
# ==================================================


def get_jwks():

    url = f"{COGNITO_ISSUER}/.well-known/jwks.json"

    response = requests.get(url, timeout=10)

    response.raise_for_status()

    return response.json()


# ==================================================
# Verify Cognito ID Token
# ==================================================


def verify_token(token: str):

    try:
        jwks = get_jwks()

        headers = jwt.get_unverified_header(token)

        key = next(key for key in jwks["keys"] if key["kid"] == headers["kid"])

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=COGNITO_ISSUER,
        )

        # Vida frontend sends ID token
        if payload.get("token_use") != "id":
            raise HTTPException(status_code=401, detail="ID token required")

        return payload

    except HTTPException:
        raise

    except Exception as e:
        print("JWT ERROR:", repr(e))

        raise HTTPException(status_code=401, detail="Invalid authentication token")


# ==================================================
# Current User Dependency
# ==================================================


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):

    token = credentials.credentials

    payload = verify_token(token)

    cognito_id = payload.get("sub")

    if not cognito_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = (
        db.query(User)
        .options(joinedload(User.organization))
        .filter(User.cognito_id == cognito_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
