variable "name_prefix" {
  type        = string
  description = "Resource name prefix, e.g. medibridge-dev."
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC."
}

variable "az_count" {
  type        = number
  default     = 2
  description = "Number of AZs to spread subnets across."
}

variable "app_port" {
  type        = number
  default     = 8000
  description = "Port the FastAPI backend listens on; ECS SG allows this from the ALB SG only."
}
