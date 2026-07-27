variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}

variable "subnet_id" {
  type        = string
  description = "Private-app subnet the jump host runs in. Must have NAT egress so the SSM agent can register."
}

variable "rds_security_group_id" {
  type        = string
  description = "The RDS instance's security group. This module adds a 5432 ingress rule to it from the jump host."
}
