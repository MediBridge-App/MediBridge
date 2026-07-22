-- 0009_create_ai_analyses.sql
-- Merges the ERD's AI_RECOMMENDATIONS with the richer ai_analyses draft:
-- stores both the classification/summary output AND any follow-up
-- recommendation text in one place per document.

CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_type VARCHAR(100),                 -- AI-predicted type
  summary TEXT,
  tags TEXT[],
  recommendation_text TEXT,
  recommendation_type VARCHAR(100),
  urgency_detected BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(5,2),
  processing_time_ms INTEGER,
  model_used VARCHAR(100),
  status VARCHAR(50) DEFAULT 'complete',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_document_id ON ai_analyses(document_id);
