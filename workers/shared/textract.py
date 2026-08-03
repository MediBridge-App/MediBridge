from typing import Any


def extract_document_text(
    *,
    bucket: str,
    key: str,
    client: Any,
) -> str:
    if not bucket.strip():
        raise ValueError("bucket must not be empty")

    if not key.strip():
        raise ValueError("key must not be empty")

    response = client.detect_document_text(
        Document={
            "S3Object": {
                "Bucket": bucket,
                "Name": key,
            }
        }
    )

    lines = [
        block["Text"]
        for block in response.get("Blocks", [])
        if block.get("BlockType") == "LINE" and block.get("Text")
    ]

    document_text = "\n".join(lines).strip()

    if not document_text:
        raise ValueError("Textract returned no document text")

    return document_text
