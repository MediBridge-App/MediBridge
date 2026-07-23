-- 0012_create_user_notification_preferences.sql
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  document_delivered BOOLEAN DEFAULT TRUE,
  document_read BOOLEAN DEFAULT TRUE,
  urgent_documents BOOLEAN DEFAULT TRUE,
  audit_events BOOLEAN DEFAULT FALSE,
  ai_processing_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
