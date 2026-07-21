-- 0001_create_organizations.sql
-- Healthcare organizations (clinics, hospitals, labs) using MediBridge.

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  org_code VARCHAR(50) UNIQUE NOT NULL,      -- short human-readable code, e.g. "STMERCY"
  type VARCHAR(50),                          -- clinic, hospital, lab, imaging_center, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organizations_org_code ON organizations(org_code);
