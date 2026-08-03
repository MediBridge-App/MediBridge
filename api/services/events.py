import json
import boto3
import os


sns_client = boto3.client(
    "sns",
    region_name=os.getenv("AWS_REGION", "us-east-2")
)


def publish_document_sent_event(document):

    sns_client.publish(
        TopicArn=os.environ["EVENTS_TOPIC_ARN"],
        Message=json.dumps(
            {
                "event_type": "document.sent",
                "document_id": str(document.id),
                "tx_ref": document.tx_ref,
                "document_type": document.document_type,
                "file_s3_key": document.file_s3_key,
                "recipient_org_id": str(document.recipient_org_id),
                "sender_org_id": str(document.sender_org_id),
            }
        ),
    )