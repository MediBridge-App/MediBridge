output "user_pool_id" {
  description = "User pool ID. Vida needs it for the login UI; Bella needs it to build the JWKS URL and validate tokens."
  value       = aws_cognito_user_pool.this.id
}

output "client_id" {
  description = "Web app client ID. Public by design (browser SPA, no secret). Vida and Bella both need it."
  value       = aws_cognito_user_pool_client.web.id
}

output "user_pool_arn" {
  description = "User pool ARN. Used if the ALB or API Gateway ever validates tokens directly."
  value       = aws_cognito_user_pool.this.arn
}

output "user_pool_endpoint" {
  description = "Pool endpoint — the base for the JWKS URL the backend fetches signing keys from."
  value       = aws_cognito_user_pool.this.endpoint
}
