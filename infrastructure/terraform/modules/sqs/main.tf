# Module: sqs
# The event pipeline: backend -> SNS topic -> SQS queue -> Lambda worker.
#
# The SNS topic is the front door. The backend publishes a "document.sent"
# event to it; SNS fans it out to the SQS queue (and to any other subscriber
# we add later — a notifications service, an audit logger — without the backend
# changing). The Lambda consumes from the queue.
#
# Messages carry a document_id / S3 key only — never document contents. The
# PHI stays in S3 and RDS; the pipeline just points at it.
#
# Inherits common tags via the provider default_tags block in the root config.

# ---------------------------------------------------------------------------
# SNS topic — the publish target for the backend
# ---------------------------------------------------------------------------
resource "aws_sns_topic" "documents" {
  name              = "${var.name_prefix}-document-events"
  kms_master_key_id = var.kms_key_arn

  tags = {
    Name = "${var.name_prefix}-document-events"
  }
}

# Subscribe the processing queue to the topic. raw_message_delivery stays FALSE
# (the default) on purpose: the worker's parser reads the SNS envelope and pulls
# the event out of the "Message" field, so the envelope must be preserved.
resource "aws_sns_topic_subscription" "processing" {
  topic_arn = aws_sns_topic.documents.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.processing.arn
}

# Allow the SNS topic to deliver into the queue. SQS denies cross-service sends
# by default; this policy grants exactly the topic (and nothing else) the right
# to SendMessage.
data "aws_iam_policy_document" "queue_policy" {
  statement {
    sid       = "AllowSNSDelivery"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.processing.arn]

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.documents.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "processing" {
  queue_url = aws_sqs_queue.processing.id
  policy    = data.aws_iam_policy_document.queue_policy.json
}

# Dead-letter queue: messages that fail repeatedly land here instead of
# retrying forever. Without it, a single poison message (a corrupt PDF) would
# loop indefinitely and block the pipeline.
resource "aws_sqs_queue" "dlq" {
  name                      = "${var.name_prefix}-processing-dlq"
  kms_master_key_id         = var.kms_key_arn
  message_retention_seconds = 1209600 # 14 days (max), so failures can be inspected

  tags = {
    Name = "${var.name_prefix}-processing-dlq"
  }
}

resource "aws_sqs_queue" "processing" {
  name              = "${var.name_prefix}-processing"
  kms_master_key_id = var.kms_key_arn

  # How long a message stays hidden after a worker picks it up. Must be >= the
  # Lambda timeout, or SQS re-delivers a message that's still being processed.
  visibility_timeout_seconds = 360

  # After 5 failed attempts, route the message to the DLQ instead of retrying.
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "${var.name_prefix}-processing"
  }
}
