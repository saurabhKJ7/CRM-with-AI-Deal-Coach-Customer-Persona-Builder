import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  const supabase = createClient();
  console.log("GET /api/deals/all called - retrieving all deals without filtering");
  
  try {
    // This query gets ALL deals, without any stage filtering
    const { data, error, count } = await supabase
      .from('deals')
      .select('*, contacts(*), companies(*)', { count: 'exact' });
    
    if (error) {
      console.error('Error fetching all deals:', error);
      throw error;
    }
    
    // Log deal stages for debugging
    const stageDistribution = data.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Found ${data.length} total deals with stage distribution:`, stageDistribution);
    
    return NextResponse.json({ 
      data,
      count,
      message: "All deals returned, including those with invalid stages"
    }, {
      headers: {
        // Prevent caching to ensure fresh data
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error in GET /api/deals/all:', error);
    return NextResponse.json(
      { error: "Failed to fetch all deals", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}