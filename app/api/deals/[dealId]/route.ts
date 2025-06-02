import { NextRequest, NextResponse } from "next/server";
import { DealService } from "@/lib/services/deal.service";

const dealService = new DealService();

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    console.log(`GET /api/deals/${dealId} called`);
    
    const deal = await dealService.getById(dealId);
    
    return NextResponse.json({ data: deal });
  } catch (error) {
    console.error(`Error in GET /api/deals/[dealId]:`, error);
    return NextResponse.json(
      { 
        error: "Failed to fetch deal", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    console.log(`PUT /api/deals/${dealId} called`);
    
    const body = await request.json();
    console.log(`Update payload:`, body);
    
    // If stage is provided, use the specialized updateStage method
    if (body.stage && Object.keys(body).length === 1) {
      console.log(`Updating deal stage to ${body.stage}`);
      const updatedDeal = await dealService.updateStage(dealId, body.stage);
      return NextResponse.json({ data: updatedDeal });
    }
    
    // Otherwise, use the general update method
    const updatedDeal = await dealService.update(dealId, body);
    
    return NextResponse.json({ data: updatedDeal });
  } catch (error) {
    console.error(`Error in PUT /api/deals/[dealId]:`, error);
    return NextResponse.json(
      { 
        error: "Failed to update deal", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    console.log(`DELETE /api/deals/${dealId} called`);
    
    await dealService.delete(dealId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/deals/[dealId]:`, error);
    return NextResponse.json(
      { 
        error: "Failed to delete deal", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
