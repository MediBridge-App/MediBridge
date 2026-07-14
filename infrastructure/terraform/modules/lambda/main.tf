# Module: lambda
# OCR/classification handlers, SQS event mapping, exec roles.
#
# TODO (lambda):
#   - Execution role: consume SQS, read S3 object, call Textract + Bedrock,
#     write logs, (optional) VPC access + RDS reach
#   - aws_lambda_function(s) for OCR + classification
#   - aws_lambda_event_source_mapping from var.source_queue_arn
#
# Inherits common tags via the provider default_tags block in the root config.
