-- Run automatically by PostgreSQL Docker image on first start.
-- Migrations (via Sequelize CLI) handle the actual table creation.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Useful for JSONB indexing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Confirm init
SELECT 'Pregnancy Health DB initialised at ' || NOW() AS status;
