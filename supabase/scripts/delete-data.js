// Script to delete all data from the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function to delete all data
async function deleteAllData() {
  try {
    console.log('Starting data deletion process...');
    
    // Delete in reverse order of dependencies
    
    // Delete activities first (they depend on contacts and deals)
    console.log('Deleting all activities...');
    const { error: activitiesError } = await supabase
      .from('activities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows
    
    if (activitiesError) {
      console.error('Error deleting activities:', activitiesError);
      return;
    }
    
    console.log('All activities deleted successfully.');
    
    // Delete deals next (they depend on contacts and companies)
    console.log('Deleting all deals...');
    const { error: dealsError } = await supabase
      .from('deals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (dealsError) {
      console.error('Error deleting deals:', dealsError);
      return;
    }
    
    console.log('All deals deleted successfully.');
    
    // Delete contacts (they depend on companies)
    console.log('Deleting all contacts...');
    const { error: contactsError } = await supabase
      .from('contacts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (contactsError) {
      console.error('Error deleting contacts:', contactsError);
      return;
    }
    
    console.log('All contacts deleted successfully.');
    
    // Delete companies last
    console.log('Deleting all companies...');
    const { error: companiesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (companiesError) {
      console.error('Error deleting companies:', companiesError);
      return;
    }
    
    console.log('All companies deleted successfully.');
    
    // We don't delete users/profiles since they're managed by Supabase Auth
    
    console.log('Data deletion completed successfully!');
    
  } catch (error) {
    console.error('An unexpected error occurred during data deletion:', error);
  }
}

// Run the deletion function
deleteAllData()
  .then(() => {
    console.log('Script execution completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });