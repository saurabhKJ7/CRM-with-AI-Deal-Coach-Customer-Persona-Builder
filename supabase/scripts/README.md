# Database Scripts for Zoho CRM Clone

This directory contains scripts to help with database management for the Zoho CRM Clone application.

## Prerequisites

Before using these scripts, make sure you have:

1. Access to your Supabase project dashboard
2. Appropriate permissions to run SQL queries in your Supabase project

## Available Scripts

### 1. SQL Seed Data Script

`seed-data.sql` populates your database with sample data for testing and demonstration purposes.

**What it adds:**
- 5 companies
- 8 contacts
- 9 deals
- 12 activities

**How to run:**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `seed-data.sql` into the editor
4. Click "Run" to execute the script

### 2. SQL Delete Data Script

`delete-data.sql` removes all data from the database tables while preserving the table structure.

**What it deletes:**
- All activities
- All deals
- All contacts
- All companies

**How to run:**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `delete-data.sql` into the editor
4. Click "Run" to execute the script

### 3. Node.js Scripts (Legacy)

The repository also contains Node.js scripts (`seed-data.js` and `delete-data.js`), but due to Row Level Security (RLS) policies in Supabase, it's recommended to use the SQL scripts instead.

## Important Notes

- These scripts manipulate real data in your database. Use with caution, especially in production environments.
- The scripts temporarily disable RLS (Row Level Security) to insert data, then re-enable it afterward.
- The scripts handle data in the correct order to respect foreign key constraints.
- User/profile data is created as needed for foreign key references.

## Troubleshooting

If you encounter any issues:

1. Check that you have the appropriate permissions in your Supabase project
2. Ensure your database tables match the expected schema
3. Look for error messages in the SQL Editor output
4. If a script fails, you may need to manually re-enable RLS for affected tables