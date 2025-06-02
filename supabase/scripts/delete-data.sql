-- Delete Data SQL Script for Zoho CRM Clone
-- This script removes all data from the database tables while preserving the table structure.
-- Run this script in the Supabase SQL Editor to clean all data.

-- Temporarily disable RLS for data deletion
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Delete data in the reverse order of dependencies
DELETE FROM activities;
DELETE FROM deals;
DELETE FROM contacts;
DELETE FROM companies;

-- Re-enable RLS for security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE 'All data has been deleted from the CRM tables';
END $$;