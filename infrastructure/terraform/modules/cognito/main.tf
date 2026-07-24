# Module: cognito
# User directory for the app. Handles sign-in and issues JWTs; the backend
# verifies those tokens and reads the user's role from the cognito:groups
# claim. Cognito answers "who is this"; the database answers "what may they do".
#
# Only a User Pool — no Identity Pool. Documents move through presigned URLs
# the backend generates, so the browser never calls AWS directly and never
# needs raw AWS credentials.
#
# Role groups match users.role byte-for-byte. Source of truth is the seed data
# in database/seed_data.sql (the actual inserted rows, not the stale comment in
# 0002_create_users.sql). The group name lands verbatim in the token, so any
# mismatch forces a translation layer where authz bugs hide. See var.user_roles.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_cognito_user_pool" "this" {
  name = "${var.name_prefix}-users"

  # Email is the login identifier.
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 12
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # MFA is OFF in dev to keep the demo simple. For a real clinical system this
  # would be "ON". Flagged as a security enhancement, not shipped.
  mfa_configuration = "OFF"

  # No self-service signup — a clinical document system should not let anyone
  # on the internet register. Accounts are created by an admin / seed script.
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name = "${var.name_prefix}-users"
  }
}

# The web app's registration with the pool. No client secret: this is a
# browser SPA, and a secret shipped to a browser is not a secret. Security
# comes from token signature verification, not from hiding the client id.
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.name_prefix}-web"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  # SRP = passwords never cross the wire in the clear. The refresh flow lets
  # the frontend get new access tokens without re-prompting.
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Short access token = the "automatic logoff" control. If a clinician walks
  # away, the session dies on its own. Refresh token bounds the outer session.
  access_token_validity  = 1 # hours
  id_token_validity      = 1 # hours
  refresh_token_validity = 8 # hours

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "hours"
  }

  prevent_user_existence_errors = "ENABLED"
}

# One group per app role. for_each over the canonical list so the values live
# in exactly one place (var.user_roles) and match the seeded users.role values.
resource "aws_cognito_user_group" "roles" {
  for_each = toset(var.user_roles)

  name         = each.value
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "App role — must match users.role in the database"
}
