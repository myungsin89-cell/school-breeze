-- Update templates table to include github_repo_url
-- Run this in Supabase SQL Editor to add real repository URLs

UPDATE templates SET github_repo_url = 'vercel/next.js' WHERE id = 1;
UPDATE templates SET github_repo_url = 'vercel/next.js' WHERE id = 2;
UPDATE templates SET github_repo_url = 'vercel/next.js' WHERE id = 3;
UPDATE templates SET github_repo_url = 'vercel/next.js' WHERE id = 4;

-- Verify the update
SELECT id, title, github_repo_url FROM templates;
