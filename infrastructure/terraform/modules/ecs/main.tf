# Module: ecs
# ECS cluster + Fargate FastAPI service + least-privilege task role.
#
# TODO (ecs):
#   - aws_ecs_cluster
#   - Task execution role (pull ECR, write logs) + task role (least privilege:
#     read specific secrets, R/W S3 prefix + presign, SQS send/receive, RDS)
#   - Task definition (Fargate) + service (desired_count=1) wired to ALB TG
#
# Inherits common tags via the provider default_tags block in the root config.
