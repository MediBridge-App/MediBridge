variable "aws_region" {
  description = "AWS region for all MediBridge dev resources."
  type        = string
  default     = "us-east-2"
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
