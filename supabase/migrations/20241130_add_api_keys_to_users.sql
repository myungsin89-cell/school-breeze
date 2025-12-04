-- Add API key columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS vercel_token text,
ADD COLUMN IF NOT EXISTS gemini_api_key text;
