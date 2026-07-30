"""
True end-to-end test of the async AI pipeline:

    document sent -> S3 -> SNS (document.sent) -> SQS (ai-processing queue)
    -> AI Lambda (Claude) -> ai_analyses row -> visible via /ai/analyses

This depends on Ayesha's SNS/SQS/Lambda infrastructure being deployed and
live, which is outside Engineer 5's ownership. Skipped until that pipeline
is confirmed up — flip the skip once it's live, and poll /ai/analyses for
the new document_id with a short retry loop (processing is async).
"""

import pytest


@pytest.mark.skip(
    reason="Depends on Ayesha's live SNS/SQS/Lambda AI pipeline — not yet "
    "deployed. Revisit once confirmed live."
)
def test_document_send_triggers_ai_analysis(base_url, auth_headers):
    pass
