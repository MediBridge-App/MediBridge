-- 0010_create_tasks.sql
-- Supports the "AI Follow-up Recommendations" stretch feature
-- (e.g. "Schedule follow-up appointment"). Part of the approved ERD;
-- not required for MVP but included so the schema doesn't need a
-- migration later if the team decides to build it.

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  assigned_to_user_id UUID REFERENCES users(id),
  created_by_user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_document_id ON tasks(document_id);
CREATE INDEX idx_tasks_assigned_to_user_id ON tasks(assigned_to_user_id);
