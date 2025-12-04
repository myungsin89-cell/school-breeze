-- Drop existing templates table if it exists (to update schema)
drop table if exists templates;

-- Create templates table
create table templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  thumbnail_url text,
  repo_url text not null, -- GitHub Repository URL
  demo_url text, -- Live Demo URL (Optional)
  category text not null, -- e.g., 'Education', 'Utility', 'Game'
  author_id uuid references users(id) not null, -- Link to custom users table
  author_name text, -- Cached author name for display
  downloads integer default 0
);

-- Enable Row Level Security (RLS)
alter table templates enable row level security;

-- Create policies
-- 1. Everyone can view templates
create policy "Templates are viewable by everyone" 
  on templates for select 
  using (true);

-- 2. Authenticated users can insert templates
create policy "Users can insert their own templates" 
  on templates for insert 
  with check (auth.uid() = author_id); -- Note: This assumes auth.uid() matches users.id. 
  -- If auth.uid() is different from users.id (which it might be if using custom auth table mixed with Supabase Auth), 
  -- we might need to adjust. But based on auth.ts, it seems we are manually managing users table.
  -- Actually, since we are using custom `users` table and NextAuth, Supabase RLS based on `auth.uid()` might not work directly 
  -- if we are not using Supabase Auth's JWT properly.
  -- However, for now, let's keep it simple. If we use service role key for inserts in API routes, RLS is bypassed.
  -- We will use API routes for insertion, so RLS on insert might not be strictly necessary if we validate in API.

-- Let's stick to API route validation for now as NextAuth + Custom Supabase Table integration can be tricky for RLS.
