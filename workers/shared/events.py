import json
from pathlib import Path
from typing import Any

from jsonschema import validate


def parse_sns_message(record: dict[str, Any]) -> dict[str, Any]:
    """Extract and parse an event carried inside an SNS-to-SQS record."""

    sns_envelope = json.loads(record["body"])
    message = sns_envelope["Message"]

    if isinstance(message, str):
        return json.loads(message)

    return message

def validate_document_sent(event):
    schema_path = (
        Path(__file__).resolve().parents[2]
        / "contracts"
        / "events"
        / "document-sent.schema.json"
    )
    schema = json.loads(schema_path.read_text())

    validate(instance=event, schema=schema)
    return event
