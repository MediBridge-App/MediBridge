# Module: observability
# CloudWatch log groups (KMS) + basic alarms.
#
# TODO (observability):
#   - Log groups for ECS, Lambda, ALB (KMS-encrypted, retention set)
#   - Alarms: Lambda errors, SQS DLQ depth, ECS unhealthy tasks
#
# Inherits common tags via the provider default_tags block in the root config.
