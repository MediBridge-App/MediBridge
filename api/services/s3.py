import uuid


def generate_presigned_upload_url(filename: str, content_type: str):

    s3_key = f"documents/{uuid.uuid4()}-{filename}"

    # Placeholder for real AWS S3 presigned URL
    upload_url = "https://placeholder-upload-url.com"

    return {
        "upload_url": upload_url,
        "s3_key": s3_key
    }