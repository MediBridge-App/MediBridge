import json
from pathlib import Path
from typing import Any

from jsonschema import validate


def _contracts_root() -> Path:
    """Locate contracts in both source-repository and Lambda layouts."""
    module_path = Path(__file__).resolve()
    candidates = (
        module_path.parents[1] / "contracts",  # Lambda: /var/task/contracts
        module_path.parents[2] / "contracts",  # Repository: <repo>/contracts
    )

    for candidate in candidates:
        if candidate.is_dir():
            return candidate

    searched = ", ".join(str(candidate) for candidate in candidates)
    raise FileNotFoundError(f"Contracts directory not found; searched: {searched}")


def parse_sns_message(record: dict[str, Any]) -> dict[str, Any]:
    """Extract and parse an event carried inside an SNS-to-SQS record."""

    sns_envelope = json.loads(record["body"])
    message = sns_envelope["Message"]

    if isinstance(message, str):
        return json.loads(message)

    return message

def validate_document_sent(event):
    schema_path = (
        _contracts_root()
        / "events"
        / "document-sent.schema.json"
    )
    schema = json.loads(schema_path.read_text())

    validate(instance=event, schema=schema)
    return event


def validate_document_analysis(
    analysis: dict[str, Any],
) -> dict[str, Any]:
    schema_path = (
        _contracts_root()
        / "ai"
        / "document-analysis.schema.json"
    )
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    validate(instance=analysis, schema=schema)
    return analysis
