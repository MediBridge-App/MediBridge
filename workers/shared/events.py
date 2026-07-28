import json
from typing import Any


def parse_sns_message(record: dict[str, Any]) -> dict[str, Any]:
    """Extract and parse an event carried inside an SNS-to-SQS record."""

    sns_envelope = json.loads(record["body"])
    message = sns_envelope["Message"]

    if isinstance(message, str):
        return json.loads(message)

    return message
