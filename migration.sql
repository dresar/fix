-- Add custom_created_at column to project table
ALTER TABLE project ADD COLUMN IF NOT EXISTS "custom_created_at" timestamp;
