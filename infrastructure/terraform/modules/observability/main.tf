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
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
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
