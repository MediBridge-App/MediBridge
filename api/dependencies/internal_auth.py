import os

from fastapi import Header, HTTPException


def verify_internal_api_key(x_api_key: str = Header(...)):
    expected_key = os.getenv("AI_INTERNAL_API_KEY")

    if not expected_key:
        raise HTTPException(status_code=500, detail="Internal API key not configured")

    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return True
