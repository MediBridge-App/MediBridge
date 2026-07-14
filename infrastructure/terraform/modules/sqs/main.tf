# Module: sqs
# Document processing queue + dead-letter queue, KMS-encrypted.
#
# TODO (sqs):
#   - aws_sqs_queue processing (SSE-KMS) with redrive to DLQ
#   - aws_sqs_queue dlq
#
# Inherits common tags via the provider default_tags block in the root config.
