import os
from typing import Any

import boto3
from shared.bedrock import analyze_document_text
from shared.events import parse_sns_message, validate_document_sent
from shared.textract import extract_document_text


def handler(
    event,
    context,
    *,
    textract_client: Any = None,
    bedrock_client: Any = None,
    model_id: str | None = None,
):
    textract_client = textract_client or boto3.client("textract")
    bedrock_client = bedrock_client or boto3.client("bedrock-runtime")
    model_id = model_id or os.environ["BEDROCK_MODEL_ID"]

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
        analyses.append(analysis)

    return {
        "statusCode": 200,
        "processed_count": len(analyses),
        "analyses": analyses,
    }
