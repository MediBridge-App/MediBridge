-- 0005_create_routing_events.sql
-- Append-only history of every routing/hand-off action for a document.
-- documents.status holds the CURRENT state; this table holds the full trail.

CREATE TABLE routing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  from_org_id UUID REFERENCES organizations(id),
  to_org_id UUID REFERENCES organizations(id),
  routed_by_user_id UUID REFERENCES users(id),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routing_events_document_id ON routing_events(document_id);
