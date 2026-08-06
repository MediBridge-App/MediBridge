variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN. Reserved for KMS-encrypting log groups in a later phase."
}

variable "alarm_emails" {
  type        = list(string)
  description = "Emails that receive alarm notifications. Each address gets its own subscription and must confirm its own link from its inbox."
}

variable "lambda_function_name" {
  type        = string
  description = "Worker Lambda function name to watch for errors."
}

variable "dlq_arn" {
  type        = string
  description = "Dead-letter queue ARN. Its depth is the top pipeline-failure signal."
}

# --- Phase 2: backend + database health ---
variable "alb_arn_suffix" {
  type        = string
  description = "ALB ARN suffix — LoadBalancer dimension for ALB alarms (5xx, latency, healthy hosts)."
}

variable "target_group_arn_suffix" {
  type        = string
  description = "Target group ARN suffix — TargetGroup dimension for the healthy-host alarm."
}
