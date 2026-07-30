import json
from typing import Any

from shared.events import validate_document_analysis

SYSTEM_PROMPT = """
You analyze synthetic clinical documents for the MediBridge educational
prototype.

Return exactly one JSON object with these fields:
- document_type
- summary
- tags
- recommendation_text
- recommendation_type
- urgency_detected
- confidence_score

Allowed document_type values:
referral, lab_result, discharge_summary, insurance_form, imaging, other.

confidence_score must be between 0 and 100.
Do not include Markdown formatting or explanatory text outside the JSON.
""".strip()


def analyze_document_text(
    document_text: str,
    *,
    client: Any,
    model_id: str,
) -> dict[str, Any]:
    if not document_text.strip():
        raise ValueError("document_text must not be empty")

    response = client.converse(
        modelId=model_id,
        system=[{"text": SYSTEM_PROMPT}],
        messages=[
            {
                "role": "user",
                "content": [{"text": document_text}],
            }
        ],
        inferenceConfig={
            "maxTokens": 1024,
            "temperature": 0,
        },
    )

    content_blocks = response["output"]["message"]["content"]
    response_text = "".join(
        block["text"]
        for block in content_blocks
        if "text" in block
    )

    analysis = json.loads(response_text)
    return validate_document_analysis(analysis)
