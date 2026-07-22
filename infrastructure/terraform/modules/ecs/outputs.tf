output "cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.this.name
}

output "service_name" {
  description = "Backend service name. Used by CI to force a new deployment."
  value       = aws_ecs_service.backend.name
}

output "task_role_arn" {
  description = "Role the running app assumes. Grant new app permissions here, not on the execution role."
  value       = aws_iam_role.task.arn
}

output "log_group_name" {
  description = "CloudWatch log group for backend container logs."
  value       = aws_cloudwatch_log_group.backend.name
}
