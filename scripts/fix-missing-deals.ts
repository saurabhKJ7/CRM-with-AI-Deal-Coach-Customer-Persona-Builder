import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

interface Deal {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  contact_id?: string;
  company_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

async function main() {
  console.log(`${colors.bright}${colors.blue}===== Deal Recovery Tool =====\n${colors.reset}`);
  console.log("This tool will help you identify and fix issues with deals in your CRM.");

  // 1. First, get total count of deals from the database
  console.log(`\n${colors.cyan}Fetching deal statistics...${colors.reset}`);
  
  const { count, error: countError } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error(`${colors.red}Error getting deal count:${colors.reset}`, countError);
    process.exit(1);
  }
  
  console.log(`${colors.green}Total deals in database: ${count}${colors.reset}`);

  // 2. Get all deals to analyze
  console.log(`\n${colors.cyan}Fetching all deals...${colors.reset}`);
  
  const { data: allDeals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (dealsError || !allDeals) {
    console.error(`${colors.red}Error fetching deals:${colors.reset}`, dealsError);
    process.exit(1);
  }
  
  console.log(`${colors.green}Successfully fetched ${allDeals.length} deals.${colors.reset}`);

  // 3. Analyze deal stages
  const stageCount: Record<string, number> = {};
  const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const invalidDeals: Deal[] = [];
  const staleDeals: Deal[] = [];
  const nowTime = new Date().getTime();
  const oneMonthAgo = nowTime - (30 * 24 * 60 * 60 * 1000);

  allDeals.forEach(deal => {
    // Count by stage
    stageCount[deal.stage] = (stageCount[deal.stage] || 0) + 1;
    
    // Check for invalid stages
    if (!validStages.includes(deal.stage)) {
      invalidDeals.push(deal);
    }
    
    // Check for stale deals
    const updatedTime = new Date(deal.updated_at).getTime();
    if (updatedTime < oneMonthAgo) {
      staleDeals.push(deal);
    }
  });

  console.log(`\n${colors.cyan}Deal Stage Distribution:${colors.reset}`);
  for (const stage of validStages) {
    console.log(`  ${stage}: ${stageCount[stage] || 0} deals`);
  }

  // 4. Check for issues
  console.log(`\n${colors.cyan}Checking for issues...${colors.reset}`);
  
  if (invalidDeals.length > 0) {
    console.log(`${colors.yellow}Found ${invalidDeals.length} deals with invalid stages${colors.reset}`);
    console.log("Invalid deals:");
    invalidDeals.forEach(deal => {
      console.log(`  - ${deal.title} (ID: ${deal.id.substring(0, 8)}..., Stage: "${deal.stage}")`);
    });
  }

  if (count !== allDeals.length) {
    console.log(`${colors.red}WARNING: Count mismatch! Database reports ${count} deals but fetched ${allDeals.length}${colors.reset}`);
  }

  const totalVisibleDeals = validStages.reduce((sum, stage) => sum + (stageCount[stage] || 0), 0);
  if (totalVisibleDeals !== allDeals.length) {
    console.log(`${colors.red}WARNING: Some deals have invalid stages! ${allDeals.length - totalVisibleDeals} deals are not showing in pipeline${colors.reset}`);
  }

  // 5. Present recovery options
  console.log(`\n${colors.bright}${colors.blue}Recovery Options:${colors.reset}`);
  console.log("1. List all deals (detailed view)");
  console.log("2. Fix deals with invalid stages");
  console.log("3. Refresh all deals' timestamps");
  console.log("4. Delete specific deal by ID");
  console.log("5. Reset all deals to visible stages");
  console.log("6. Exit");

  const choice = await askQuestion("\nSelect an option (1-6): ");

  switch (choice) {
    case "1":
      await listAllDeals(allDeals);
      break;
    case "2":
      await fixInvalidStages(invalidDeals);
      break;
    case "3":
      await refreshTimestamps(allDeals);
      break;
    case "4":
      await deleteDeal();
      break;
    case "5":
      await resetAllDeals(allDeals);
      break;
    case "6":
      console.log("Exiting...");
      break;
    default:
      console.log(`${colors.red}Invalid option${colors.reset}`);
  }

  rl.close();
}

async function listAllDeals(deals: Deal[]) {
  console.log(`\n${colors.cyan}All Deals (${deals.length}):${colors.reset}`);
  console.log("-".repeat(100));
  console.log("| ID            | Title                    | Stage        | Amount    | Updated At        |");
  console.log("-".repeat(100));
  
  deals.forEach(deal => {
    const id = deal.id.substring(0, 12).padEnd(14);
    const title = (deal.title || "").substring(0, 24).padEnd(24);
    const stage = (deal.stage || "").padEnd(12);
    const amount = deal.amount ? `$${deal.amount.toLocaleString()}`.padEnd(10) : "N/A".padEnd(10);
    const updatedAt = new Date(deal.updated_at).toLocaleString();
    
    console.log(`| ${id} | ${title} | ${stage} | ${amount} | ${updatedAt} |`);
  });
  console.log("-".repeat(100));
  
  const answer = await askQuestion("\nDo you want to save this list to a file? (y/n): ");
  if (answer.toLowerCase() === 'y') {
    const fs = require('fs');
    const fileName = `deals-export-${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deals, null, 2));
    console.log(`${colors.green}Deals saved to ${fileName}${colors.reset}`);
  }
}

async function fixInvalidStages(invalidDeals: Deal[]) {
  if (invalidDeals.length === 0) {
    console.log(`${colors.green}No invalid stages found!${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.yellow}Found ${invalidDeals.length} deals with invalid stages:${colors.reset}`);
  invalidDeals.forEach((deal, index) => {
    console.log(`${index + 1}. "${deal.title}" - Current stage: "${deal.stage}"`);
  });
  
  const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  console.log(`\nValid stages are: ${validStages.join(', ')}`);
  
  const defaultStage = 'lead';
  const proceed = await askQuestion(`\nFix all invalid deals by setting them to "${defaultStage}"? (y/n): `);
  
  if (proceed.toLowerCase() === 'y') {
    const { data, error } = await supabase
      .from('deals')
      .update({ 
        stage: defaultStage,
        updated_at: new Date().toISOString()
      })
      .in('id', invalidDeals.map(d => d.id))
      .select();
      
    if (error) {
      console.error(`${colors.red}Error fixing invalid stages:${colors.reset}`, error);
    } else {
      console.log(`${colors.green}Successfully fixed ${data.length} deals${colors.reset}`);
    }
  } else {
    console.log("Operation cancelled.");
  }
}

async function refreshTimestamps(allDeals: Deal[]) {
  const proceed = await askQuestion(`\nThis will update the timestamps of all ${allDeals.length} deals. Proceed? (y/n): `);
  
  if (proceed.toLowerCase() === 'y') {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('deals')
      .update({ updated_at: now })
      .in('id', allDeals.map(d => d.id))
      .select();
      
    if (error) {
      console.error(`${colors.red}Error refreshing timestamps:${colors.reset}`, error);
    } else {
      console.log(`${colors.green}Successfully refreshed timestamps for ${data.length} deals${colors.reset}`);
    }
  } else {
    console.log("Operation cancelled.");
  }
}

async function deleteDeal() {
  const dealId = await askQuestion("\nEnter the deal ID to delete: ");
  
  const { data, error: fetchError } = await supabase
    .from('deals')
    .select('id, title')
    .eq('id', dealId)
    .single();
  
  if (fetchError) {
    console.error(`${colors.red}Error: Deal not found${colors.reset}`);
    return;
  }
  
  const confirm = await askQuestion(`Are you sure you want to delete deal "${data.title}"? (y/n): `);
  
  if (confirm.toLowerCase() === 'y') {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);
      
    if (error) {
      console.error(`${colors.red}Error deleting deal:${colors.reset}`, error);
    } else {
      console.log(`${colors.green}Deal successfully deleted${colors.reset}`);
    }
  } else {
    console.log("Deletion cancelled.");
  }
}

async function resetAllDeals(allDeals: Deal[]) {
  console.log(`\n${colors.yellow}WARNING: This will reset all ${allDeals.length} deals to ensure they have valid stages${colors.reset}`);
  console.log("Any deal with an invalid stage will be set to 'lead'");
  
  const proceed = await askQuestion("Are you sure you want to proceed? (y/n): ");
  
  if (proceed.toLowerCase() === 'y') {
    // First, get all deals with invalid stages
    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const invalidDeals = allDeals.filter(deal => !validStages.includes(deal.stage));
    
    if (invalidDeals.length > 0) {
      console.log(`Fixing ${invalidDeals.length} deals with invalid stages...`);
      
      const { data, error } = await supabase
        .from('deals')
        .update({ 
          stage: 'lead',
          updated_at: new Date().toISOString()
        })
        .in('id', invalidDeals.map(d => d.id))
        .select();
        
      if (error) {
        console.error(`${colors.red}Error fixing invalid stages:${colors.reset}`, error);
      } else {
        console.log(`${colors.green}Successfully fixed ${data.length} deals${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}No invalid stages found!${colors.reset}`);
    }
    
    // Now update all deals' timestamps
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('deals')
      .update({ updated_at: now })
      .in('id', allDeals.map(d => d.id))
      .select();
      
    if (error) {
      console.error(`${colors.red}Error refreshing timestamps:${colors.reset}`, error);
    } else {
      console.log(`${colors.green}Successfully refreshed timestamps for ${data.length} deals${colors.reset}`);
    }
  } else {
    console.log("Operation cancelled.");
  }
}

main().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});