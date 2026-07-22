-- 0006_create_document_access.sql
-- Explicit access grants per organization. Per the team's clarification
-- (Olga, re: comment c10), a document stays associated with BOTH the
-- sending and receiving org. This table makes that explicit and leaves
-- room to grant access to additional orgs later without schema changes.

CREATE TABLE document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  access_level VARCHAR(50) DEFAULT 'read',    -- read, write, owner
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, organization_id)
);

CREATE INDEX idx_document_access_document_id ON document_access(document_id);
CREATE INDEX idx_document_access_organization_id ON document_access(organization_id);
