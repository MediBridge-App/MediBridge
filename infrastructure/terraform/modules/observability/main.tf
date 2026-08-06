# Module: observability
# Alarms that notify a human when the pipeline or worker breaks. Notifications
# go to an SNS topic with an email subscription. Phase 1 covers the highest-value
# signals — pipeline/worker failures. Backend-health alarms (ECS/ALB) are a
# follow-up once the ALB exposes its arn_suffix.
#
# Inherits common tags via the provider default_tags block in the root config.

locals {
  # SQS CloudWatch metrics key off the queue NAME, not the ARN. The name is the
  # last colon-separated field of the ARN (arn:aws:sqs:region:account:NAME).
  dlq_name = split(":", var.dlq_arn)[5]

  # These names are deterministic from name_prefix (see the ecs/rds modules), so
  # we derive them here instead of wiring module outputs. That keeps this module
  # from depending on the ecs/rds resources — important when applying with
  # -target, so their pending changes don't get pulled into an alarms-only apply.
  ecs_cluster_name = "${var.name_prefix}-cluster"
  ecs_service_name = "${var.name_prefix}-backend"
  db_instance_id   = "${var.name_prefix}-db"
}

# ---------------------------------------------------------------------------
# Where alarms go: an SNS topic + email subscription. After the first apply,
# AWS emails a confirmation link to var.alarm_email — you MUST click it, or no
# notifications are delivered.
# ---------------------------------------------------------------------------
resource "aws_sns_topic" "alarms" {
  name = "${var.name_prefix}-alarms"

  tags = {
    Name = "${var.name_prefix}-alarms"
  }
}

resource "aws_sns_topic_subscription" "email" {
  for_each  = toset(var.alarm_emails)
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = each.value
}

# ---------------------------------------------------------------------------
# Alarm 1 — messages in the dead-letter queue. Anything above 0 means the worker
# failed to process a document and it got parked. This is the clearest
# "the pipeline is broken" signal, so it's the most important alarm here.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "dlq_not_empty" {
  alarm_name        = "${var.name_prefix}-dlq-not-empty"
  alarm_description = "Messages landed in the dead-letter queue — document processing is failing."

  namespace   = "AWS/SQS"
  metric_name = "ApproximateNumberOfMessagesVisible"
  dimensions  = { QueueName = local.dlq_name }

  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# ---------------------------------------------------------------------------
# Alarm 2 — the worker Lambda threw errors in the last 5 minutes.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name        = "${var.name_prefix}-worker-errors"
  alarm_description = "The document-processing Lambda is throwing errors."

  namespace   = "AWS/Lambda"
  metric_name = "Errors"
  dimensions  = { FunctionName = var.lambda_function_name }

  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# ---------------------------------------------------------------------------
# Phase 2 — backend + database health
# ---------------------------------------------------------------------------

# THE key backend alarm: no healthy targets behind the ALB = the API is down.
# treat_missing_data = "breaching" so "no data at all" also alerts.
resource "aws_cloudwatch_metric_alarm" "alb_no_healthy_hosts" {
  alarm_name        = "${var.name_prefix}-alb-no-healthy-hosts"
  alarm_description = "No healthy backend targets behind the ALB — the API is down."

  namespace   = "AWS/ApplicationELB"
  metric_name = "HealthyHostCount"
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  statistic           = "Minimum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "breaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Backend returning server errors.
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name        = "${var.name_prefix}-alb-5xx"
  alarm_description = "Backend is returning 5xx errors (more than 5 in 5 minutes)."

  namespace   = "AWS/ApplicationELB"
  metric_name = "HTTPCode_Target_5XX_Count"
  dimensions  = { LoadBalancer = var.alb_arn_suffix }

  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 5
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Backend slow — average response time over 2s for 15 minutes.
resource "aws_cloudwatch_metric_alarm" "alb_latency" {
  alarm_name        = "${var.name_prefix}-alb-high-latency"
  alarm_description = "Backend response time is high (>2s average)."

  namespace   = "AWS/ApplicationELB"
  metric_name = "TargetResponseTime"
  dimensions  = { LoadBalancer = var.alb_arn_suffix }

  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = 2
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Backend CPU pinned high.
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name        = "${var.name_prefix}-ecs-cpu-high"
  alarm_description = "Backend ECS service CPU is high (>80%)."

  namespace   = "AWS/ECS"
  metric_name = "CPUUtilization"
  dimensions = {
    ClusterName = local.ecs_cluster_name
    ServiceName = local.ecs_service_name
  }

  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Database disk filling up — free storage under 2 GB.
resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  alarm_name        = "${var.name_prefix}-rds-low-storage"
  alarm_description = "RDS free storage is below 2 GB."

  namespace   = "AWS/RDS"
  metric_name = "FreeStorageSpace"
  dimensions  = { DBInstanceIdentifier = local.db_instance_id }

  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 2147483648 # 2 GB in bytes
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Database CPU pinned high.
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name        = "${var.name_prefix}-rds-cpu-high"
  alarm_description = "RDS CPU is high (>80%)."

  namespace   = "AWS/RDS"
  metric_name = "CPUUtilization"
  dimensions  = { DBInstanceIdentifier = local.db_instance_id }

  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}
