# Testing the CRM with Sample Data

This guide explains how to use the provided SQL scripts to populate your database with sample data and test the CRM application's features.

## Prerequisites

- Access to your Supabase project dashboard
- Appropriate permissions to run SQL queries
- Supabase project set up with the correct tables

## Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to your project
3. Click on the "SQL Editor" option in the left sidebar

## Step 2: Seed the Database

Run the seed SQL script to populate your database with sample data:

1. Open the file `zoho-crm-clone/supabase/scripts/seed-data.sql`
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" to execute the script

This will add:
- 5 companies
- 8 contacts
- 9 deals in various stages
- 12 activities with different types and priorities

## Step 3: Test the CRM Features

After seeding the database, start your CRM application:

```bash
cd ../../
npm run dev
```

Now you can explore all the features of the CRM with sample data:

### Dashboard
- View key metrics showing total contacts, deals, and activities
- See pipeline summary chart with deals in different stages
- Check recent activities and top deals

### Contacts Page
- Browse the list of contacts
- View contact details
- Edit contact information
- Filter and search contacts

### Deals Page
- See the pipeline view with deals in different stages
- Drag deals between stages to update their status
- View deal details and associated contacts
- Filter deals by stage, amount, etc.

### Activities Page
- Check upcoming and overdue activities
- Mark activities as completed
- Create new activities
- Associate activities with contacts and deals

### Reports Page
- View sales metrics and pipeline analysis
- See activity distribution by type
- Analyze deal sources and values

## Step 4: Reset the Database (Optional)

If you want to start fresh, you can delete all sample data:

1. Open the file `zoho-crm-clone/supabase/scripts/delete-data.sql`
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" to execute the script

This will remove all records while preserving the table structure.

## Expected Results

When viewing the CRM with sample data, you should see:

- **Dashboard:** Full metrics, colorful charts, and populated activity lists
- **Pipeline:** Deals distributed across all pipeline stages
- **Activities:** Mix of completed and pending activities
- **Reports:** Charts and graphs with meaningful data distribution

## Troubleshooting

If data doesn't appear in the UI:

1. Check the browser console for API errors
2. Verify the `.env` file has correct Supabase credentials
3. Ensure the database tables have the expected structure
4. Look at the Supabase dashboard to confirm data was inserted properly
5. Check for SQL execution errors in the SQL Editor output
6. Verify that Row Level Security (RLS) policies are correctly configured for your tables

## Next Steps

After testing with sample data, you can:

1. Add your own real data
2. Customize the CRM for your specific needs
3. Extend functionality with additional features
4. Deploy the application to production