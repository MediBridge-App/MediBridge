output "topic_arn" {
  description = "SNS topic the backend PUBLISHES document.sent events to. This is the enqueue target now, not the queue."
  value       = aws_sns_topic.documents.arn
}

output "processing_queue_url" {
  description = "Queue URL — internal to the pipeline. The backend publishes to the topic, not here."
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

output "dlq_name" {
  description = "Dead-letter queue name, used by CloudWatch alarms."
  value       = aws_sqs_queue.dlq.name
}