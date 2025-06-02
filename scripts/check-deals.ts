import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Checking deals in database...');

  // Fetch all deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('id, title, stage, amount, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    process.exit(1);
  }

  // Count deals by stage
  const stageCount = {};
  deals.forEach(deal => {
    stageCount[deal.stage] = (stageCount[deal.stage] || 0) + 1;
  });

  console.log('\n=== Deal Stage Distribution ===');
  console.table(stageCount);

  console.log('\n=== All Deals ===');
  console.table(deals.map(deal => ({
    id: deal.id.substring(0, 8) + '...',
    title: deal.title,
    stage: deal.stage,
    amount: deal.amount,
    updated: new Date(deal.updated_at).toLocaleString()
  })));

  // Look for potential issues
  console.log('\n=== Recently Updated Deals ===');
  const recentDeals = deals.filter(deal => {
    const updatedAt = new Date(deal.updated_at);
    const now = new Date();
    // Deals updated in the last 24 hours
    return (now.getTime() - updatedAt.getTime()) < 24 * 60 * 60 * 1000;
  });

  console.table(recentDeals.map(deal => ({
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    amount: deal.amount,
    updated: new Date(deal.updated_at).toLocaleString()
  })));
}

main()
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });