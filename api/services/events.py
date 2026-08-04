import json
import os
import uuid
from datetime import datetime, timezone

import boto3

sns_client = boto3.client("sns", region_name=os.getenv("AWS_REGION", "us-east-2"))


def publish_document_sent_event(document, actor_user_id):

    event_id = str(uuid.uuid4())

    response = sns_client.publish(
        TopicArn=os.environ["EVENTS_TOPIC_ARN"],
        Message=json.dumps(
            {
                "event_id": event_id,
                "event_type": "document.sent",
                "occurred_at": datetime.now(timezone.utc).isoformat(),
                "document_id": str(document.id),
                "sender_organization_id": str(document.sender_org_id),
                "recipient_organization_id": str(document.recipient_org_id),
                "actor_user_id": str(actor_user_id),
                "s3_bucket": os.environ["S3_BUCKET_NAME"],
                "s3_key": document.file_s3_key,
                "correlation_id": event_id,
            }
        ),
    )

    print("SNS MessageId:", response["MessageId"])
