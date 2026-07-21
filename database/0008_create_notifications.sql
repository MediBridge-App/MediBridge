-- 0008_create_notifications.sql
-- Not in the original approved ERD, but required by the GET /notifications
-- endpoint and the frontend's Notifications page. Adding it here to close
-- that gap.

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  type VARCHAR(100) NOT NULL,                 -- new_document, urgent, delivery_confirmed,
                                               -- ai_complete, security_alert
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
