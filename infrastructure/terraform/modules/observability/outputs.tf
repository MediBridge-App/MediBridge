output "alarm_topic_arn" {
  description = "SNS topic alarms publish to. Subscribe more endpoints (Slack, extra emails) here later."
  value       = aws_sns_topic.alarms.arn
}
