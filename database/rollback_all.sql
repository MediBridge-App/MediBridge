-- rollback_all.sql
-- Drops everything in reverse dependency order. Useful for resetting
-- your local dev database while iterating on the schema.
-- (Not meant to run against RDS once real data exists.)

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS ai_analyses;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS document_access;
DROP TABLE IF EXISTS routing_events;
DROP TABLE IF EXISTS document_text;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
