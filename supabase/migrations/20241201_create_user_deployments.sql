-- Create user_deployments table
CREATE TABLE IF NOT EXISTS public.user_deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    repo_name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    deployment_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.user_deployments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own deployments
CREATE POLICY "Users can view their own deployments"
    ON public.user_deployments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own deployments
CREATE POLICY "Users can insert their own deployments"
    ON public.user_deployments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own deployments
CREATE POLICY "Users can delete their own deployments"
    ON public.user_deployments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_deployments_user_id ON public.user_deployments(user_id);
