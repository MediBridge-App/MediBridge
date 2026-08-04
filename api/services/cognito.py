import os
import requests

from dotenv import load_dotenv
from jose import jwt
from fastapi import HTTPException

load_dotenv()


AWS_REGION = os.getenv("AWS_REGION")

COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")


COGNITO_ISSUER = (
    f"https://cognito-idp.{AWS_REGION}.amazonaws.com/" f"{COGNITO_USER_POOL_ID}"
)


def get_jwks():

    jwks_url = f"{COGNITO_ISSUER}/" ".well-known/jwks.json"

    response = requests.get(jwks_url)

    response.raise_for_status()

    return response.json()


def verify_token(token: str):

    try:

        jwks = get_jwks()

        headers = jwt.get_unverified_header(token)

        key = next(k for k in jwks["keys"] if k["kid"] == headers["kid"])

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
            issuer=COGNITO_ISSUER,
        )

        # Make sure frontend sent Cognito Access Token
        if payload.get("token_use") != "access":

            raise HTTPException(status_code=401, detail="Access token required")

        return payload

    except Exception as e:

        print("JWT ERROR:", e)

        raise HTTPException(status_code=401, detail="Invalid authentication token")
