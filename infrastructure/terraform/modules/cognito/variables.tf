variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

# Canonical role list. MUST stay identical to users.role in the database.
# Source of truth: the seeded rows in database/seed_data.sql (the comment in
# 0002_create_users.sql is stale — it still lists the old 4-role set). The
# group name lands verbatim in the JWT cognito:groups claim, so a mismatch
# forces a translation layer where authz bugs hide.
#
# TODO for the DB team: add a CHECK constraint on users.role with exactly these
# values, and fix the stale comment, so the database enforces what nothing
# currently enforces.
variable "user_roles" {
  type = list(string)
  default = [
    "organization_admin",
    "provider",
    "registered_nurse",
    "referral_coordinator",
    "medical_assistant",
  ]
  description = "App roles, one Cognito group each. Match users.role byte-for-byte."
}
