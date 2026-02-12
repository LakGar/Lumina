-- Run this against your database if you get:
-- "The column `EntrySummary.qualityScore` does not exist in the current database."
-- Example: psql $DATABASE_URL -f prisma/migrations/MANUAL_ADD_QUALITY_SCORE.sql

ALTER TABLE "EntrySummary" ADD COLUMN IF NOT EXISTS "qualityScore" DOUBLE PRECISION;
