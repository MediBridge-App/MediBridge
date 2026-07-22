-- 0003_create_documents.sql
-- Core clinical documents exchanged between organizations.

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_ref VARCHAR(50) UNIQUE NOT NULL,        -- human-friendly reference, e.g. "TX-8821"
  sender_org_id UUID NOT NULL REFERENCES organizations(id),
  recipient_org_id UUID NOT NULL REFERENCES organizations(id),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  file_s3_key VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,
  document_type VARCHAR(100),                -- referral, lab_result, discharge_summary, insurance_form
                                              -- (nullable until AI classification completes)
  subject VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'normal',      -- urgent, normal, routine
  status VARCHAR(50) DEFAULT 'uploaded',      -- uploaded, ocr_complete, classified, routed, delivered
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_documents_sender_org_id ON documents(sender_org_id);
CREATE INDEX idx_documents_recipient_org_id ON documents(recipient_org_id);
CREATE INDEX idx_documents_uploaded_by_user_id ON documents(uploaded_by_user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_tx_ref ON documents(tx_ref);
