import os
import requests

from dotenv import load_dotenv
from jose import jwt
from fastapi import HTTPException

load_dotenv()


AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")

COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")


def get_jwks():

    jwks_url = (
        f"https://cognito-idp."
        f"{AWS_REGION}.amazonaws.com/"
        f"{COGNITO_USER_POOL_ID}/"
        ".well-known/jwks.json"
    )

    response = requests.get(jwks_url)

    response.raise_for_status()

    return response.json()


def verify_token(token: str):

    try:

        jwks = get_jwks()

        headers = jwt.get_unverified_header(token)

        key = next(k for k in jwks["keys"] if k["kid"] == headers["kid"])

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)

        payload = jwt.decode(
            token, public_key, algorithms=["RS256"], audience=COGNITO_CLIENT_ID
        )

        return payload

    except Exception as e:

        print(e)

        raise HTTPException(status_code=401, detail="Invalid authentication token")
