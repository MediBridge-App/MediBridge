output "function_name" {
  description = "Worker function name. Ayesha targets this with `aws lambda update-function-code`."
  value       = aws_lambda_function.worker.function_name
}

output "function_arn" {
  description = "Worker function ARN."
  value       = aws_lambda_function.worker.arn
}

output "role_arn" {
  description = "Worker execution role. Grant new worker permissions here."
  value       = aws_iam_role.worker.arn
}
