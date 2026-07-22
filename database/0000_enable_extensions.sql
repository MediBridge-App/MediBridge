-- 0000_enable_extensions.sql
-- Enables pgcrypto so we can use gen_random_uuid() for all primary keys.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
