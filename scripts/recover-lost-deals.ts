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

// List of deals that were meant to be in the "lost" stage
// Add your deal IDs here, for example:
// const lostDealIds = ['deal-id-1', 'deal-id-2', 'deal-id-3'];
const lostDealIds: string[] = [];

async function main() {
  if (lostDealIds.length === 0) {
    console.log('No deal IDs provided. Please add deal IDs to the lostDealIds array.');
    return;
  }

  console.log(`Attempting to recover ${lostDealIds.length} lost deals...`);

  // First, fetch the current state of these deals
  const { data: currentDeals, error: fetchError } = await supabase
    .from('deals')
    .select('id, title, stage')
    .in('id', lostDealIds);

  if (fetchError) {
    console.error('Error fetching deals:', fetchError);
    process.exit(1);
  }

  console.log('\nCurrent state of deals:');
  console.table(currentDeals);

  // Confirm before proceeding
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise<void>((resolve) => {
    readline.question('\nDo you want to update these deals to "lost" stage? (yes/no): ', async (answer: string) => {
      if (answer.toLowerCase() === 'yes') {
        // Update all deals to "lost" stage
        const { data, error } = await supabase
          .from('deals')
          .update({ 
            stage: 'lost',
            updated_at: new Date().toISOString()
          })
          .in('id', lostDealIds)
          .select('id, title, stage');

        if (error) {
          console.error('Error updating deals:', error);
        } else {
          console.log('\nSuccessfully updated deals:');
          console.table(data);
        }
      } else {
        console.log('Operation cancelled.');
      }
      readline.close();
      resolve();
    });
  });

  // Verify the update
  const { data: verifiedDeals, error: verifyError } = await supabase
    .from('deals')
    .select('id, title, stage, updated_at')
    .in('id', lostDealIds);

  if (verifyError) {
    console.error('Error verifying deals:', verifyError);
  } else {
    console.log('\nVerified state after update:');
    console.table(verifiedDeals.map(deal => ({
      id: deal.id,
      title: deal.title,
      stage: deal.stage,
      updated: new Date(deal.updated_at).toLocaleString()
    })));
  }
}

main()
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  })
  .finally(() => {
    console.log('\nOperation completed.');
  });