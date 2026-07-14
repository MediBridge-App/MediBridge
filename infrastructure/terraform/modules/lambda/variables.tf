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

variable "app_subnet_ids" {
  type        = list(string)
  default     = []
  description = "Private app subnets if the function needs VPC/RDS access."
}
