import { type NextRequest, NextResponse } from "next/server"
import { DealService } from "@/lib/services/deal.service"

const dealService = new DealService()

export async function GET(request: NextRequest) {
  console.log("GET /api/deals called");
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get("stage")
    const contactId = searchParams.get("contactId")
    const companyId = searchParams.get("companyId")
    const assignedTo = searchParams.get("assignedTo")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "100") // Increased to ensure all deals are returned
    
    console.log("Deals list query params:", { stage, contactId, companyId, assignedTo, page, pageSize });

    let result;
    try {
      result = await dealService.getAll({
        stage: stage || undefined,
        contactId: contactId || undefined,
        companyId: companyId || undefined,
        assignedTo: assignedTo || undefined,
        page,
        pageSize,
      });
    } catch (serviceError) {
      console.error("Error in dealService.getAll:", serviceError);
      throw serviceError;
    }
    
    const { data: deals, count } = result;
    
    console.log(`Fetched ${deals?.length || 0} deals, total count: ${count}`);
    // Log distribution of deals by stage
    const stageDistribution = deals?.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});
    console.log("Deals by stage:", stageDistribution);

    // Ensure deals is always an array, even if it's null/undefined
    const safeDeals = Array.isArray(deals) ? deals : [];

    const response = { 
      data: safeDeals,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      }
    };
    console.log("Sending deals response with pagination:", response.pagination);
    return NextResponse.json(response, {
      headers: {
        // Prevent caching to ensure fresh data
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error in GET /api/deals:', error)
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    console.log("Sending error response:", errorDetails);
    return NextResponse.json(
      { error: "Failed to fetch deals", details: errorDetails }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process empty string values for contact_id and company_id
    // Also handle title/name mapping if needed
    const processedBody = {
      ...body,
      // If title is provided but name isn't, use title as name
      name: body.name || body.title,
      // Handle empty or invalid UUID for contact_id
      contact_id: body.contact_id === '' || body.contact_id === 'none' ? null : body.contact_id,
      // Handle empty, invalid UUID, or numeric ID for company_id
      company_id: body.company_id === '' || body.company_id === 'none' || !body.company_id ? null : 
        // Check if company_id is a valid UUID, if not, set to null
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.company_id) ? 
          body.company_id : null
    }
    
    // Add required fields with valid UUIDs since we're not doing authentication yet
    const dummyUuid = '00000000-0000-0000-0000-000000000000'; // Valid UUID for testing
    
    const dealData = {
      ...processedBody,
      created_by: dummyUuid,
      assigned_to: processedBody.assigned_to || dummyUuid // Use provided assigned_to or fallback to dummy UUID
    };
    
    const deal = await dealService.create(dealData)
    
    return NextResponse.json({ data: deal }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/deals:', error)
    return NextResponse.json(
      { error: "Failed to create deal", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}