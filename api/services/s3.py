import uuid
import os

import boto3
from dotenv import load_dotenv


load_dotenv()


def get_s3_client():

    return boto3.client(
        "s3",
        region_name=os.getenv(
            "AWS_REGION",
            "us-east-1"
        )
    )


def generate_presigned_upload_url(
    filename: str,
    content_type: str
):

    bucket_name = os.getenv(
        "S3_BUCKET_NAME"
    )


    if not bucket_name:
        raise Exception(
            "S3_BUCKET_NAME is not configured"
        )


    s3_key = (
        f"documents/"
        f"{uuid.uuid4()}-"
        f"{filename}"
    )


    s3_client = get_s3_client()


    upload_url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": s3_key,
            "ContentType": content_type
        },
        ExpiresIn=3600
    )


    return {
        "upload_url": upload_url,
        "s3_key": s3_key
    }