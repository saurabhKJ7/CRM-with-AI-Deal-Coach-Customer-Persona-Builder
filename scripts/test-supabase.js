// This script tests the Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log(`- URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`- Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection by fetching server timestamp
async function testConnection() {
  try {
    const { data, error } = await supabase.rpc('now');
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('🕒 Server time:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(error.message);
    return false;
  }
}

testConnection();
