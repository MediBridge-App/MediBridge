import json
from typing import Any

import boto3


def get_internal_api_key(
    secret_arn: str,
    *,
    client: Any = None,
) -> str:
    if not secret_arn or not secret_arn.strip():
        raise ValueError("secret_arn must not be empty")

    client = client or boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_arn)

    secret_string = response.get("SecretString")
    if not secret_string:
        raise ValueError("SecretString is missing from the application secret")

    secret_values = json.loads(secret_string)
    api_key = secret_values.get("AI_INTERNAL_API_KEY")

    if not isinstance(api_key, str) or not api_key.strip():
        raise ValueError(
            "AI_INTERNAL_API_KEY is missing from the application secret"
        )

    return api_key