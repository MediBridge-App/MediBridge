output "processing_queue_url" {
  description = "Queue URL the backend sends document-processing jobs to."
  value       = aws_sqs_queue.processing.url
}

output "processing_queue_arn" {
  description = "Processing queue ARN — the Lambda event source mapping consumes this."
  value       = aws_sqs_queue.processing.arn
}

output "dlq_arn" {
  description = "Dead-letter queue ARN. Watch its depth — messages here means processing is failing."
  value       = aws_sqs_queue.dlq.arn
}
