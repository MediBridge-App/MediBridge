-- 0015_add_user_and_org_profile_fields.sql
-- Aligns users + organizations with the Figma-based schema (Role Assignment doc)
-- and with backend/api's Alembic migrations (adc9bd3076dd_add_remaining_backend_tables).
--
-- users: add specialty + npi_number (backend already expects these; RDS was missing them)
-- organizations: add timezone, date_format, language (same root cause — backend's
--   OrganizationResponse requires these, GET /organizations will 500 without them)

ALTER TABLE users
  ADD COLUMN specialty VARCHAR(100),
  ADD COLUMN npi_number VARCHAR(20);

ALTER TABLE organizations
  ADD COLUMN timezone VARCHAR(100) DEFAULT 'America/Chicago',
  ADD COLUMN date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  ADD COLUMN language VARCHAR(50) DEFAULT 'English (US)';
