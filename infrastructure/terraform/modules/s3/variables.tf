variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN for SSE-KMS."
}

# Origins allowed to upload/download directly from the browser. Needed because
# the frontend PUTs to S3 directly via presigned URLs — a cross-origin request
# the browser blocks unless the bucket allows the origin. Dev values here; add
# the real frontend URL (CloudFront/domain) when it exists.
variable "cors_allowed_origins" {
  type = list(string)
  default = [
    "http://localhost:3000", # Create React App / Next.js
    "http://localhost:5173", # Vite
  ]
  description = "Frontend origins permitted for browser uploads/downloads."
}
