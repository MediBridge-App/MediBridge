import requests

# 1. Get presigned URL from FastAPI
response = requests.post(
    "http://localhost:8000/documents/upload-url",
    json={
        "filename": "test.pdf",
        "content_type": "application/pdf"
    }
)

response.raise_for_status()

data = response.json()

upload_url = data["upload_url"]

print("S3 Key:", data["s3_key"])

# 2. Upload file to S3
with open("test.pdf", "rb") as f:
    file_data = f.read()

upload_response = requests.put(
    upload_url,
    data=file_data,
    headers={
        "Content-Type": "application/pdf",
        "x-amz-server-side-encryption": "aws:kms"
    }
)

print("Upload status:", upload_response.status_code)

if upload_response.status_code == 200:
    print("Upload successful!")
else:
    print(upload_response.text)