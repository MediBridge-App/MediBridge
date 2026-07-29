-- 0011_create_security_settings.sql
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  mfa_enabled BOOLEAN DEFAULT TRUE,
  ip_allowlisting_enabled BOOLEAN DEFAULT FALSE,
  session_timeout_minutes INTEGER DEFAULT 30,
  last_security_scan TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE INDEX idx_security_settings_organization_id ON security_settings(organization_id);
