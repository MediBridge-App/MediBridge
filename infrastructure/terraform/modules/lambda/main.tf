# Module: lambda
# ---------------------------------------------------------------------------
# The async worker that processes uploaded documents: pulls a job off SQS,
# runs Textract (OCR), calls Bedrock (classification), and records the result.
#
# What's deployed here is the INFRASTRUCTURE — the execution role with the
# right permissions, the function shell, and the SQS trigger. The function
# ships with a placeholder handler; Ayesha replaces the code with the real
# OCR/classification logic (via `aws lambda update-function-code` or CI). The
# role is the important part: it's what lets her code call Textract, Bedrock,
# S3, and KMS without any keys.
#
# Not in a VPC (for now). It reaches Textract/Bedrock/S3 over AWS's public
# endpoints and updates document status via the backend API. If the worker
# ever needs to hit RDS directly, add app_subnet_ids + a security group and
# give the RDS SG an ingress rule from it.
#
# Inherits common tags via the provider default_tags block in the root config.
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ---------------------------------------------------------------------------
# Execution role — what the worker code is allowed to do. Least privilege:
# exactly the services the pipeline touches, nothing else.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "worker" {
  name               = "${var.name_prefix}-worker"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

# CloudWatch Logs (write log streams). AWS-managed, minimal.
resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.worker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "worker" {
  # Consume from the processing queue. Required for the event source mapping.
  statement {
    sid = "ConsumeQueue"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [var.source_queue_arn]
  }

  # Read the uploaded document out of S3.
  statement {
    sid       = "ReadDocuments"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.document_bucket}/*"]
  }

  # Decrypt S3 objects and SQS messages (both encrypted with the CMK).
  statement {
    sid       = "UseEncryptionKey"
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = [var.kms_key_arn]
  }

  # OCR.
  statement {
    sid = "Textract"
    actions = [
      "textract:DetectDocumentText",
      "textract:AnalyzeDocument",
      "textract:StartDocumentTextDetection",
      "textract:GetDocumentTextDetection",
    ]
    resources = ["*"] # Textract has no per-resource ARNs to scope to.
  }

  # Classification. Anthropic models only, plus the cross-region inference
  # profiles the newer models require (the "us." prefix Ayesha will hit).
  statement {
    sid     = "Bedrock"
    actions = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
    resources = [
      "arn:aws:bedrock:*::foundation-model/anthropic.*",
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:inference-profile/*",
    ]
  }

  # Read the internal backend API key at runtime.
  statement {
    sid       = "ReadAppSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.app_secrets_arn]
  }
}

resource "aws_iam_role_policy" "worker" {
  name   = "${var.name_prefix}-worker-policy"
  role   = aws_iam_role.worker.id
  policy = data.aws_iam_policy_document.worker.json
}

# ---------------------------------------------------------------------------
# The function. Placeholder code so the pipeline is wired end-to-end before
# Ayesha's real handler exists. She overwrites the code; Terraform keeps
# managing the role, trigger, and config.
# ---------------------------------------------------------------------------
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = <<-PY
      def handler(event, context):
          # Placeholder — replace with the OCR/classification worker.
          print(f"received {len(event.get('Records', []))} message(s)")
          return {"ok": True}
    PY
    filename = "handler.py"
  }
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/lambda/${var.name_prefix}-worker"
  retention_in_days = 30
}

resource "aws_lambda_function" "worker" {
  function_name    = "${var.name_prefix}-worker"
  role             = aws_iam_role.worker.arn
  runtime          = "python3.12"
  handler          = "handler.handler"
  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  timeout     = 300 # 5 min. Must stay <= the queue's visibility timeout (360).
  memory_size = 512

  environment {
    variables = {
      DOCUMENT_BUCKET = var.document_bucket
      BACKEND_API_URL = var.backend_api_url
      APP_SECRETS_ARN = var.app_secrets_arn
    }
  }

  # Ayesha deploys real code out of band, so don't let Terraform revert it back
  # to the placeholder on the next apply. Remove this once a CI deploy owns it.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }

  depends_on = [aws_cloudwatch_log_group.worker]
}

# Wire the queue to the function: SQS delivers batches, Lambda processes them.
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = var.source_queue_arn
  function_name    = aws_lambda_function.worker.arn
  batch_size       = 1
}
