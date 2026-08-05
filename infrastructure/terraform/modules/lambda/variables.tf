variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "source_queue_arn" {
  type        = string
  description = "SQS queue that triggers the function."
}

variable "document_bucket" {
  type        = string
  description = "S3 bucket holding documents to read."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN. The worker needs Decrypt/GenerateDataKey for encrypted S3 objects and SQS messages."
}

variable "app_subnet_ids" {
  type        = list(string)
  default     = []
  description = "Private app subnets, only if the function needs VPC/RDS access. Empty = not in a VPC."
}

variable "backend_api_url" {
  type        = string
  description = "Base HTTPS URL for the backend API."
}

variable "app_secrets_arn" {
  type        = string
  description = "ARN of the application secret containing AI_INTERNAL_API_KEY."
}

variable "bedrock_model_id" {
  type        = string
  default     = "us.amazon.nova-micro-v1:0"
  description = "Amazon Bedrock inference profile ID used for document analysis."

  validation {
    condition     = var.bedrock_model_id == "us.amazon.nova-micro-v1:0"
    error_message = "The worker must use the Amazon Nova Micro US inference profile through Amazon Bedrock."
  }
}