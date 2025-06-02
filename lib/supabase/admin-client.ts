import { createClient } from '@supabase/supabase-js'
import { supabase } from './client' // Import the regular client as fallback

// This client uses the service role key which bypasses RLS
// WARNING: Only use this for development or in secure server contexts
// NEVER expose this client to the browser

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create admin client only if service role key is available
// Otherwise fall back to regular client (which will use RLS)
let adminClient;

try {
  if (supabaseServiceKey) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Using regular client with RLS.')
    adminClient = supabase
  }
} catch (error) {
  console.error('Error creating admin client:', error)
  adminClient = supabase
}

export const supabaseAdmin = adminClient
