# Module: cognito
# User pool + app client + role groups (optional MFA).
#
# TODO (cognito):
#   - aws_cognito_user_pool (password policy, optional MFA)
#   - aws_cognito_user_pool_client for the web app
#   - One aws_cognito_user_group per app role. Group names MUST match
#     users.role byte-for-byte — the group name lands verbatim in the
#     JWT "cognito:groups" claim, so any mismatch forces a mapping layer.
#     CANONICAL LIST: database/0002_create_users.sql
#     Do not restate the values here; reference that file.
#
# Inherits common tags via the provider default_tags block in the root config.
