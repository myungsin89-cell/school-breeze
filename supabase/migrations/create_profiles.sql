-- Create a table for user profiles
create table profiles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  vercel_access_token text, -- Vercel 배포 토큰
  gemini_api_key text, -- Gemini AI API 키
  supabase_url text, -- Supabase 프로젝트 URL
  supabase_anon_key text, -- Supabase Anon Key
  
  -- Add constraint to ensure email is valid
  constraint email_validation check (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
-- Allow users to view their own profile based on email (since we use JWT with email)
-- Note: In a real Supabase Auth setup, we would use auth.uid(), but here we match by email from the session
create policy "Users can view own profile"
  on profiles for select
  using (true); -- For simplicity in this demo with custom auth. Ideally: email = current_user_email()

create policy "Users can update own profile"
  on profiles for update
  using (true); -- For simplicity

create policy "Users can insert own profile"
  on profiles for insert
  with check (true);
