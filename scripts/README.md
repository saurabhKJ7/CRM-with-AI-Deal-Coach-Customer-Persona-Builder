# Deal Recovery Tools

This directory contains tools to help recover and fix issues with deals in your CRM system.

## Available Tools

1. **check-deals.ts** - Displays current deals and their status
2. **fix-missing-deals.ts** - Comprehensive recovery tool for fixing deal issues
3. **recover-lost-deals.ts** - Tool to restore deals to "lost" stage

## Quick Start

```bash
# Check the current state of deals
npm run check-deals

# Run the comprehensive recovery tool
npm run fix-deals
```

## How to Recover Missing or Lost Deals

### Method 1: Using the UI

1. Click the "Refresh Pipeline" button to force a complete refresh
2. If deals are still missing, click "Show All Deals" to view all deals including those with invalid stages

### Method 2: Using the Recovery Tool

Run the comprehensive recovery tool:

```bash
npm run fix-deals
```

This interactive tool will:
- Show you the current state of all deals
- Identify deals with invalid stages
- Allow you to fix specific issues
- Reset timestamps to ensure deals are up-to-date

### Method 3: Manually Updating Specific Deals

If you know which deals need to be fixed:

1. Edit `recover-lost-deals.ts` to include specific deal IDs:
   ```typescript
   const lostDealIds = ['deal-id-1', 'deal-id-2'];
   ```

2. Run the recovery script:
   ```bash
   npx ts-node scripts/recover-lost-deals.ts
   ```

## Common Issues and Solutions

### Missing Deals

Deals may not appear in the pipeline due to:
- Invalid stage values
- Caching issues
- Race conditions during updates

The "Show All Deals" button will display all deals regardless of stage, helping you identify missing ones.

### Deals Disappearing After Drag-and-Drop

If deals disappear after being dragged to a new stage:
1. Click "Refresh Pipeline"
2. If the deal is still missing, run the recovery tool

## Database Fields

For reference, each deal has these key fields:
- `id`: Unique identifier
- `title`: Deal name
- `stage`: Pipeline stage (should be one of: lead, qualified, proposal, negotiation, won, lost)
- `amount`: Deal value
- `updated_at`: Last update timestamp