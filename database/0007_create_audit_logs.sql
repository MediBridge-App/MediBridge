-- 0007_create_audit_logs.sql
-- Immutable audit trail. Answers Adrian's questions (c13/c14): each row is
-- ONE discrete action, and `details` is a flexible JSON blob for
-- action-specific metadata (e.g. which fields changed on a status update).
-- `hash` supports tamper-evidence (hash of previous row + this row's data).

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(50) UNIQUE NOT NULL,       -- human-friendly ref, e.g. "EVT-001291"
  document_id UUID REFERENCES documents(id),  -- nullable: some events aren't document-specific (e.g. login)
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  event_type VARCHAR(100) NOT NULL,           -- document_sent, file_upload, ai_processing,
                                               -- document_read, user_login, auth_failure,
                                               -- notification_sent, document_received
  action TEXT NOT NULL,                       -- human-readable description
  details JSONB,                              -- structured extra context
  ip_address VARCHAR(45),
  hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_document_id ON audit_logs(document_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
