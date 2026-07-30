"""
End-to-end test of the core document journey, entirely within our own
control (API + database) — no dependency on the SNS/SQS/Lambda/AI pipeline,
which is owned by Ayesha's workers and tested separately once that
infrastructure is live.

Flow covered:
  1. Org 1 user sends a document to Org 2
  2. Org 2 user sees it in their inbox
  3. A "document_sent" audit log entry was recorded
  4. Org 1 user updates the document status
  5. Org 2 user sees the updated status reflected in their inbox
"""

import requests

RECIPIENT_ORG_ID = "a0000000-0000-4000-8000-000000000002"  # Riverside Cardiology


def test_full_document_journey(base_url, auth_headers, auth_headers_user2):

    # 1. Send the document as the Org 1 user
    send_response = requests.post(
        f"{base_url}/documents/send",
        headers=auth_headers,
        json={
            "recipient_org_id": RECIPIENT_ORG_ID,
            "document_type": "lab_result",
            "subject": "E2E test — full document journey",
            "priority": "normal",
            "notes": "created by integration-tests/test_document_flow.py",
            "file_s3_key": "documents/e2e-test.pdf",
            "original_filename": "e2e-test.pdf",
            "file_size": 2048,
        },
    )
    assert send_response.status_code == 200, send_response.text
    document = send_response.json()
    assert document["status"] == "uploaded"
    assert document["recipient_org_id"] == RECIPIENT_ORG_ID

    document_id = document["id"]
    tx_ref = document["tx_ref"]

    # 2. Confirm Org 2 sees it in their inbox
    inbox_response = requests.get(
        f"{base_url}/documents/inbox", headers=auth_headers_user2
    )
    assert inbox_response.status_code == 200
    inbox_tx_refs = [doc["tx_ref"] for doc in inbox_response.json()]
    assert tx_ref in inbox_tx_refs, (
        "Sent document did not appear in the recipient org's inbox"
    )

    # 3. Confirm a document_sent audit entry was recorded
    audit_response = requests.get(f"{base_url}/audit", headers=auth_headers)
    assert audit_response.status_code == 200
    matching_events = [
        event
        for event in audit_response.json()
        if event["document_id"] == document_id
        and event["event_type"] == "document_sent"
    ]
    assert matching_events, (
        f"No document_sent audit log entry found for document {document_id}"
    )

    # 4. Update the document's status
    status_response = requests.put(
        f"{base_url}/documents/{document_id}/status",
        headers=auth_headers,
        json={"status": "ocr_complete"},
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "ocr_complete"

    # 5. Confirm Org 2 sees the updated status
    inbox_after = requests.get(
        f"{base_url}/documents/inbox", headers=auth_headers_user2
    ).json()
    updated_doc = next(doc for doc in inbox_after if doc["tx_ref"] == tx_ref)
    assert updated_doc["status"] == "ocr_complete"


def test_org2_inbox_does_not_leak_other_orgs_documents(
    base_url, auth_headers_user2
):
    """Cross-service authorization check: Org 2's inbox should only ever
    contain documents where Org 2 is sender or recipient."""
    response = requests.get(
        f"{base_url}/documents/inbox", headers=auth_headers_user2
    )
    assert response.status_code == 200
    for doc in response.json():
        assert RECIPIENT_ORG_ID in (
            doc["sender_org_id"],
            doc["recipient_org_id"],
        ), f"Document {doc['tx_ref']} leaked into an org that isn't party to it"
