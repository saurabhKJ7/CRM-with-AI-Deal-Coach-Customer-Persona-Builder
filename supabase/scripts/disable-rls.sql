-- Script to disable Row Level Security (RLS) for all tables
-- Run this in your Supabase SQL Editor for troubleshooting

-- Disable RLS for core tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;

-- Confirm RLS status (uncomment to check status)
-- SELECT 
--     n.nspname as schema,
--     c.relname as table,
--     CASE WHEN c.relrowsecurity THEN 'RLS enabled' ELSE 'RLS disabled' END as rls_status
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
-- AND c.relkind = 'r'  -- Only tables
-- ORDER BY n.nspname, c.relname;

-- Note: After troubleshooting, you may want to re-enable RLS with:
-- ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;