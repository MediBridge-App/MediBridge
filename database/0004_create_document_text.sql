-- 0004_create_document_text.sql
-- Extracted OCR text, kept in its own table so large text blobs
-- don't bloat the main documents table.

CREATE TABLE document_text (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  extracted_text TEXT,
  ocr_status VARCHAR(50) DEFAULT 'pending',   -- pending, processing, complete, failed
  ocr_completed_at TIMESTAMP
);

CREATE INDEX idx_document_text_document_id ON document_text(document_id);
