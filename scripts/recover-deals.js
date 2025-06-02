// Recover missing deals script - JavaScript version
// No ts-node dependency needed

const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

// Get environment variables from .env file
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const vars = {};
      
      envFile.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          vars[key.trim()] = value.replace(/^["'](.*)["']$/, '$1');
        }
      });
      
      return vars;
    }
  } catch (error) {
    console.log(`${colors.red}Error loading .env file: ${error.message}${colors.reset}`);
  }
  
  return {};
}

// Ask a question and get the answer
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log(`${colors.bright}${colors.blue}===== Deal Recovery Tool =====\n${colors.reset}`);
  console.log("This tool will help you recover missing deals in your CRM database.");
  
  // Load environment variables
  const envVars = loadEnvVars();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log(`${colors.red}Error: Missing Supabase credentials in .env file${colors.reset}`);
    console.log("Make sure your .env file contains:");
    console.log("NEXT_PUBLIC_SUPABASE_URL=your-project-url");
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
    process.exit(1);
  }
  
  console.log(`${colors.green}Found Supabase credentials.${colors.reset}`);
  
  // Display recovery options
  console.log(`\n${colors.cyan}Choose a recovery option:${colors.reset}`);
  console.log("1. Reset all deals (fix invalid stages and refresh timestamps)");
  console.log("2. Set specific deal to 'lost' stage");
  console.log("3. Display all deals in database");
  console.log("4. Exit");
  
  const choice = await askQuestion("\nEnter your choice (1-4): ");
  
  switch (choice) {
    case "1":
      await resetAllDeals(supabaseUrl, supabaseKey);
      break;
    case "2":
      await setDealToLost(supabaseUrl, supabaseKey);
      break;
    case "3":
      await displayAllDeals(supabaseUrl, supabaseKey);
      break;
    case "4":
      console.log("Exiting...");
      break;
    default:
      console.log(`${colors.red}Invalid choice${colors.reset}`);
  }
  
  rl.close();
}

// Reset all deals to have valid stages
async function resetAllDeals(supabaseUrl, supabaseKey) {
  console.log(`${colors.yellow}This will fix all deals with invalid stages and refresh timestamps.${colors.reset}`);
  const confirm = await askQuestion("Are you sure you want to proceed? (y/n): ");
  
  if (confirm.toLowerCase() !== 'y') {
    console.log("Operation cancelled.");
    return;
  }
  
  // Create SQL to fix deals
  const sqlCommands = `
    -- Fix deals with invalid stages
    UPDATE deals 
    SET stage = 'lead', 
        updated_at = NOW() 
    WHERE stage NOT IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
    
    -- Refresh timestamps for all deals
    UPDATE deals 
    SET updated_at = NOW();
    
    -- Count deals by stage
    SELECT stage, COUNT(*) 
    FROM deals 
    GROUP BY stage 
    ORDER BY stage;
  `;
  
  // Create a temporary SQL file
  const tmpFile = path.join(process.cwd(), 'tmp_fix_deals.sql');
  fs.writeFileSync(tmpFile, sqlCommands);
  
  // Run the SQL commands using psql
  console.log(`${colors.cyan}Running SQL commands to fix deals...${colors.reset}`);
  
  // Create a command that outputs the database URL and executes psql
  const psqlCommand = `
    echo "DATABASE_URL=${supabaseUrl.replace('https://', 'postgresql://postgres:${supabaseKey}@')}" && 
    psql "$(echo $DATABASE_URL)" -f ${tmpFile}
  `;
  
  try {
    // Execute the command
    exec(psqlCommand, (error, stdout, stderr) => {
      // Remove the temporary file
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      
      if (error) {
        console.log(`${colors.red}Error executing SQL:${colors.reset} ${stderr || error.message}`);
        console.log(`\n${colors.yellow}Alternative: Use the web UI:${colors.reset}`);
        console.log("1. Open your app in the browser");
        console.log("2. Click the 'Show All Deals' button");
        console.log("3. Then click 'Refresh Pipeline'");
        return;
      }
      
      console.log(`${colors.green}Successfully fixed deals:${colors.reset}`);
      console.log(stdout);
      console.log(`\n${colors.green}Recovery complete!${colors.reset} Please refresh your app.`);
    });
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log("Could not execute the SQL commands.");
  }
}

// Set a specific deal to the 'lost' stage
async function setDealToLost(supabaseUrl, supabaseKey) {
  const dealId = await askQuestion("Enter the deal ID to set as 'lost': ");
  
  if (!dealId) {
    console.log(`${colors.red}No deal ID provided.${colors.reset}`);
    return;
  }
  
  // Create SQL to update the deal
  const sqlCommands = `
    -- Set the deal to 'lost' stage
    UPDATE deals 
    SET stage = 'lost', 
        updated_at = NOW() 
    WHERE id = '${dealId}';
    
    -- Verify the update
    SELECT id, title, stage, updated_at 
    FROM deals 
    WHERE id = '${dealId}';
  `;
  
  // Create a temporary SQL file
  const tmpFile = path.join(process.cwd(), 'tmp_set_lost.sql');
  fs.writeFileSync(tmpFile, sqlCommands);
  
  // Run the SQL commands using psql
  console.log(`${colors.cyan}Setting deal ${dealId} to 'lost' stage...${colors.reset}`);
  
  // Create a command that outputs the database URL and executes psql
  const psqlCommand = `
    echo "DATABASE_URL=${supabaseUrl.replace('https://', 'postgresql://postgres:${supabaseKey}@')}" && 
    psql "$(echo $DATABASE_URL)" -f ${tmpFile}
  `;
  
  try {
    // Execute the command
    exec(psqlCommand, (error, stdout, stderr) => {
      // Remove the temporary file
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      
      if (error) {
        console.log(`${colors.red}Error executing SQL:${colors.reset} ${stderr || error.message}`);
        return;
      }
      
      console.log(`${colors.green}Successfully updated deal:${colors.reset}`);
      console.log(stdout);
      console.log(`\n${colors.green}Deal updated!${colors.reset} Please refresh your app.`);
    });
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log("Could not execute the SQL commands.");
  }
}

// Display all deals in the database
async function displayAllDeals(supabaseUrl, supabaseKey) {
  // Create SQL to display deals
  const sqlCommands = `
    -- Count deals by stage
    SELECT stage, COUNT(*) 
    FROM deals 
    GROUP BY stage 
    ORDER BY stage;
    
    -- Show all deals
    SELECT id, title, stage, amount, updated_at 
    FROM deals 
    ORDER BY updated_at DESC;
  `;
  
  // Create a temporary SQL file
  const tmpFile = path.join(process.cwd(), 'tmp_display_deals.sql');
  fs.writeFileSync(tmpFile, sqlCommands);
  
  // Run the SQL commands using psql
  console.log(`${colors.cyan}Fetching all deals from database...${colors.reset}`);
  
  // Create a command that outputs the database URL and executes psql
  const psqlCommand = `
    echo "DATABASE_URL=${supabaseUrl.replace('https://', 'postgresql://postgres:${supabaseKey}@')}" && 
    psql "$(echo $DATABASE_URL)" -f ${tmpFile}
  `;
  
  try {
    // Execute the command
    exec(psqlCommand, (error, stdout, stderr) => {
      // Remove the temporary file
      try { fs.unlinkSync(tmpFile); } catch (e) {}
      
      if (error) {
        console.log(`${colors.red}Error executing SQL:${colors.reset} ${stderr || error.message}`);
        return;
      }
      
      console.log(`${colors.green}Deals in database:${colors.reset}`);
      console.log(stdout);
    });
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log("Could not execute the SQL commands.");
  }
}

// Start the script
main().catch(error => {
  console.log(`${colors.red}Unhandled error:${colors.reset} ${error.message}`);
  process.exit(1);
});