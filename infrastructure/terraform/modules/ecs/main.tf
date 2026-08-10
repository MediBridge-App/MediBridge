# Module: ecs
# Fargate cluster running the FastAPI backend in private subnets, behind the
# ALB. Fargate means AWS manages the hosts — we never patch an OS.
#
# Two roles, deliberately separate:
#   execution role — what AWS needs to START the container (pull the image,
#                    write logs). Used before the app runs.
#   task role      — what the APP may do once running (S3, KMS, Secrets).
#                    This is the one that matters for least privilege.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.name_prefix}-backend"
  retention_in_days = var.log_retention_days

  # CMK-encrypted at rest. Requires the AllowCloudWatchLogsToUseKey statement in
  # the kms module's key policy — without it, CreateLogGroup fails AccessDenied.
  kms_key_id = var.kms_key_arn
}

resource "aws_ecs_cluster" "this" {
  name = "${var.name_prefix}-cluster"

  tags = {
    Name = "${var.name_prefix}-cluster"
  }
}

# ---------------------------------------------------------------------------
# Execution role — used by ECS itself, before the container starts
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${var.name_prefix}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# AWS-managed policy covering ECR pulls and log writes.
resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Secret injection happens at task launch via the EXECUTION role (not the task
# role). To inject AI_INTERNAL_API_KEY from the app secret, the execution role
# needs to read that secret and decrypt it with the CMK. Scoped to just the app
# secret + the key — nothing broader.
data "aws_iam_policy_document" "execution_secrets" {
  statement {
    sid       = "ReadAppSecretForInjection"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.app_secrets_arn]
  }
  statement {
    sid       = "DecryptAppSecret"
    actions   = ["kms:Decrypt"]
    resources = [var.kms_key_arn]
  }
}

resource "aws_iam_role_policy" "execution_secrets" {
  name   = "${var.name_prefix}-ecs-execution-secrets"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secrets.json
}

# ---------------------------------------------------------------------------
# Task role — what the running application may do
# ---------------------------------------------------------------------------

resource "aws_iam_role" "task" {
  name               = "${var.name_prefix}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "task" {
  statement {
    sid       = "ReadWriteDocuments"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${var.document_bucket_arn}/*"]
  }

  statement {
    sid       = "ListDocumentBucket"
    actions   = ["s3:ListBucket"]
    resources = [var.document_bucket_arn]
  }

  # Decrypt to read objects, GenerateDataKey to write them. Granting only
  # Decrypt makes downloads work and uploads fail — a confusing afternoon.
  statement {
    sid       = "UseEncryptionKey"
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = [var.kms_key_arn]
  }

  statement {
    sid       = "ReadSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.db_secret_arn, var.app_secrets_arn]
  }

  # Publish document.sent events to the SNS topic that feeds the OCR/AI
  # pipeline. Only granted when a topic ARN is wired in.
  dynamic "statement" {
    for_each = var.events_topic_arn == "" ? [] : [1]
    content {
      sid       = "PublishDocumentEvents"
      actions   = ["sns:Publish"]
      resources = [var.events_topic_arn]
    }
  }
}

resource "aws_iam_role_policy" "task" {
  name   = "${var.name_prefix}-ecs-task-policy"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task.json
}

# ---------------------------------------------------------------------------
# Task definition and service
# ---------------------------------------------------------------------------

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.name_prefix}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${var.ecr_backend_url}:${var.image_tag}"
    essential = true

    portMappings = [{
      containerPort = var.app_port
      protocol      = "tcp"
    }]

    # Only non-secret config here. The DB password is never an env var — the
    # app gets the secret ARN and fetches the value itself using the task role,
    # so the password never appears in the task definition or the console.
    # Env vars the backend code reads (os.getenv in api/database.py,
    # api/services/*). This is the authoritative list — keep it in sync with the
    # code. DATABASE_URL is NOT here on purpose: the backend builds it from
    # DB_HOST/DB_PORT/DB_NAME + the DB secret. DOCUMENT_BUCKET/APP_SECRETS_ARN/
    # APP_PORT were removed — the backend never reads them (only the worker uses
    # DOCUMENT_BUCKET, in the lambda module).
    environment = [
      { name = "AWS_REGION", value = var.aws_region },
      { name = "S3_BUCKET_NAME", value = var.document_bucket_name },
      { name = "DB_HOST", value = var.db_host },
      { name = "DB_PORT", value = tostring(var.db_port) },
      { name = "DB_NAME", value = var.db_name },
      { name = "DB_SECRET_ARN", value = var.db_secret_arn },
      { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
      { name = "COGNITO_CLIENT_ID", value = var.cognito_client_id },
      { name = "FRONTEND_URL", value = var.frontend_url },
      { name = "EVENTS_TOPIC_ARN", value = var.events_topic_arn },
    ]

    # AI_INTERNAL_API_KEY is a shared secret (backend <-> worker), injected from
    # Secrets Manager at runtime — never plaintext here. Both sides read the same
    # secret field, so they always agree (fixes the earlier value mismatch). The
    # execution role's execution_secrets policy grants the read+decrypt.
    secrets = [
      {
        name      = "AI_INTERNAL_API_KEY"
        valueFrom = "${var.app_secrets_arn}:AI_INTERNAL_API_KEY::"
      },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "${var.name_prefix}-backend"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.app_subnet_ids
    security_groups = [var.security_group_id]

    # Private subnets, no public IP. Outbound goes through the NAT gateway.
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "backend"
    container_port   = var.app_port
  }

  # Give a new task time to boot before the ALB starts failing it.
  health_check_grace_period_seconds = 60

  # The backend is deployed out-of-band (image push + `aws ecs update-service
  # --force-new-deployment`), so the DEPLOY process owns which task-definition
  # revision and how many tasks run — not Terraform. Ignoring these stops
  # Terraform from reverting a live deploy on the next apply.
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}
