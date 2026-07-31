import os
from typing import Any

import boto3

from shared.backend import save_analysis
from shared.bedrock import analyze_document_text
from shared.events import parse_sns_message, validate_document_sent
from shared.secrets import get_internal_api_key
from shared.textract import extract_document_text


def handler(
    event,
    context,
    *,
    textract_client: Any = None,
    bedrock_client: Any = None,
    model_id: str | None = None,
    backend_saver: Any = save_analysis,
    backend_base_url: str | None = None,
    backend_api_key: str | None = None,
):
    textract_client = textract_client or boto3.client("textract")
    bedrock_client = bedrock_client or boto3.client("bedrock-runtime")
    model_id = model_id or os.environ["BEDROCK_MODEL_ID"]
    backend_base_url = backend_base_url or os.environ["BACKEND_API_URL"]
    backend_api_key = backend_api_key or get_internal_api_key(
        os.environ["APP_SECRETS_ARN"]
    )
    analyses = []

    for record in event["Records"]:
        document_event = parse_sns_message(record)
        validate_document_sent(document_event)

        document_text = extract_document_text(
            bucket=document_event["s3_bucket"],
            key=document_event["s3_key"],
            client=textract_client,
        )

        analysis = analyze_document_text(
            document_text,
            client=bedrock_client,
            model_id=model_id,
        )

        backend_payload = {
            "document_id": document_event["document_id"],
            "document_type": analysis["document_type"],
            "summary": analysis["summary"],
            "tags": analysis["tags"],
            "recommendation_text": analysis["recommendation_text"],
            "recommendation_type": analysis["recommendation_type"],
            "urgency_detected": analysis["urgency_detected"],
            "confidence_score": analysis["confidence_score"],
            "processing_time_ms": analysis.get("processing_time_ms"),
            "model_used": model_id,
            "status": "complete",
        }

        backend_saver(
            backend_payload,
            base_url=backend_base_url,
            api_key=backend_api_key,
        )

        analyses.append(analysis)

    return {
        "statusCode": 200,
        "processed_count": len(analyses),
        "analyses": analyses,
    }
