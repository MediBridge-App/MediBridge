# Module: sqs
# The handoff between the backend (enqueues a document to process) and the
# workers (consume and run OCR/classification). One processing queue plus a
# dead-letter queue for messages that keep failing.
#
# Messages carry a document_id / S3 key only — never document contents. The
# PHI stays in S3 and RDS; the queue just points at it.
#
# Inherits common tags via the provider default_tags block in the root config.

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
