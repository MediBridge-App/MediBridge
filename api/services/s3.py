import uuid
import os

import boto3
from dotenv import load_dotenv

load_dotenv()


def get_s3_client():

    return boto3.client("s3", region_name=os.getenv("AWS_REGION", "us-east-2"))


def generate_presigned_upload_url(filename: str, content_type: str):

    bucket_name = os.getenv("S3_BUCKET_NAME")

    if not bucket_name:
        raise Exception("S3_BUCKET_NAME is not configured")

    # Create UUID-based S3 key
    # Do not expose original filename in S3 path
    file_extension = ""

    if "." in filename:
        file_extension = filename.split(".")[-1]

    s3_key = f"documents/" f"{uuid.uuid4()}"

    if file_extension:
        s3_key += f".{file_extension}"

    s3_client = get_s3_client()

    upload_url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": s3_key,
            "ContentType": content_type,
            # Required because bucket enforces KMS encryption
            "ServerSideEncryption": "aws:kms",
        },
        ExpiresIn=900,  # 15 minutes
    )

    return {"upload_url": upload_url, "s3_key": s3_key, "expires_in": 900}


def generate_presigned_download_url(s3_key: str):

    bucket_name = os.getenv("S3_BUCKET_NAME")

    if not bucket_name:
        raise Exception("S3_BUCKET_NAME is not configured")

    s3_client = get_s3_client()

    download_url = s3_client.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket_name,
            "Key": s3_key,
        },
        ExpiresIn=900,  # 15 minutes
    )

    return {"download_url": download_url, "expires_in": 900}
