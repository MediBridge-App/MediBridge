variable "aws_region" {
  description = "AWS region for all MediBridge dev resources."
  type        = string
  default     = "us-east-2"
}

variable "bedrock_model_id" {
  description = "Amazon Bedrock inference profile used by the document-analysis worker."
  type        = string
  default     = "us.amazon.nova-micro-v1:0"

  validation {
    condition     = var.bedrock_model_id == "us.amazon.nova-micro-v1:0"
    error_message = "MediBridge must use the Amazon Nova Micro US inference profile through Amazon Bedrock."
  }
}

variable "project" {
  description = "Project name, used in resource naming and tags."
  type        = string
  default     = "medibridge"
}

variable "environment" {
  description = "Deployment environment (dev first; staging/prod later)."
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Team member accountable for the infrastructure."
  type        = string
  default     = "Olga"
}

variable "vpc_cidr" {
  description = "CIDR block for the MediBridge VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of Availability Zones to spread subnets across."
  type        = number
  default     = 2
}

variable "domain_name" {
  description = "Registered domain for the app (e.g. medibridge.click). App served at app.<domain_name>."
  type        = string
}

variable "hosted_zone_id" {
  description = "Route 53 hosted zone ID for domain_name."
  type        = string
}

variable "alarm_emails" {
  description = "Emails that receive CloudWatch alarm notifications. Each address confirms its own subscription from its inbox after apply."
  type        = list(string)
}
