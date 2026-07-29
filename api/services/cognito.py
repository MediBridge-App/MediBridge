import os
import requests

from dotenv import load_dotenv
from jose import jwt
from fastapi import HTTPException


load_dotenv()


AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv(
    "COGNITO_USER_POOL_ID"
)
COGNITO_CLIENT_ID = os.getenv(
    "COGNITO_CLIENT_ID"
)


JWKS_URL = (
    f"https://cognito-idp."
    f"{AWS_REGION}.amazonaws.com/"
    f"{COGNITO_USER_POOL_ID}/"
    ".well-known/jwks.json"
)


jwks = requests.get(JWKS_URL).json()



def verify_token(token: str):

    try:

        headers = jwt.get_unverified_header(
            token
        )


        key = next(
            key
            for key in jwks["keys"]
            if key["kid"] == headers["kid"]
        )


        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID
        )


        return payload


    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )