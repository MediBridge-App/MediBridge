import time
import requests

RECIPIENT_ORG_ID = "a0000000-0000-4000-8000-000000000002"  # Riverside Cardiology

# Smallest valid one-page PDF we could inline, just enough for Textract to
# return non-empty text.
_MINIMAL_PDF = (
    b"%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Contents 4 0 R"
    b"/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
    b"4 0 obj<</Length 58>>stream\n"
    b"BT /F1 18 Tf 20 100 Td (E2E AI pipeline test document) Tj ET\n"
    b"endstream endobj\n"
    b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
    b"trailer<</Root 1 0 R>>"
)

POLL_INTERVAL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 90

def test_document_send_triggers_ai_analysis(base_url, auth_headers, auth_headers_user2):
    # 1. Get a real presigned upload URL and actually upload something, so
    # Textract has real bytes to extract text from.
    upload_url_response = requests.post(
        f"{base_url}/documents/upload-url",
        headers=auth_headers,
        json={"filename": "e2e-ai-pipeline-test.pdf", "content_type": "application/pdf"},
    )
    assert upload_url_response.status_code == 200, upload_url_response.text
    upload_info = upload_url_response.json()

    put_response = requests.put(
        upload_info["upload_url"],
        data=_MINIMAL_PDF,
        headers={
            "Content-Type": "application/pdf",
            # Presigned URL was generated with ServerSideEncryption=aws:kms,
            # so the PUT must send the matching header or S3 rejects it.
            "x-amz-server-side-encryption": "aws:kms",
        },
    )
    assert put_response.status_code == 200, put_response.text

    # 2. Send the document referencing the real uploaded object
    send_response = requests.post(
        f"{base_url}/documents/send",
        headers=auth_headers,
        json={
            "recipient_org_id": RECIPIENT_ORG_ID,
            "document_type": "lab_result",
            "subject": "E2E test — AI pipeline",
            "priority": "normal",
            "notes": "created by integration-tests/test_ai_pipeline_e2e.py",
            "file_s3_key": upload_info["s3_key"],
            "original_filename": "e2e-ai-pipeline-test.pdf",
            "file_size": len(_MINIMAL_PDF),
        },
    )
    assert send_response.status_code == 200, send_response.text
    document_id = send_response.json()["id"]

    # 3. Poll for the AI analysis to show up. Processing is async
    # (SNS -> SQS -> Lambda -> Textract -> Bedrock -> backend), so this
    # can take a while — analysis is only visible to the recipient org.
    deadline = time.monotonic() + POLL_TIMEOUT_SECONDS
    analysis = None

    while time.monotonic() < deadline:
        response = requests.get(
            f"{base_url}/ai/analyses/{document_id}", headers=auth_headers_user2
        )
        if response.status_code == 200:
            analysis = response.json()
            break
        assert response.status_code == 404, response.text
        time.sleep(POLL_INTERVAL_SECONDS)

    assert analysis is not None, (
        f"No AI analysis appeared for document {document_id} within "
        f"{POLL_TIMEOUT_SECONDS}s — check the SNS topic, SQS queue, and "
        f"Lambda logs for medibridge-dev-worker"
    )
    assert analysis["summary"], "AI analysis saved but summary is empty"
    assert analysis["status"] == "complete"
