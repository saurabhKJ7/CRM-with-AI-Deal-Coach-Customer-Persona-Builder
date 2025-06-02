import { type NextRequest, NextResponse } from "next/server"
import { DealService } from "@/lib/services/deal.service"

const dealService = new DealService()

export async function GET(request: NextRequest) {
  try {
    const pipelineSummary = await dealService.getPipelineSummary()
    
    return NextResponse.json({
      data: pipelineSummary,
      metadata: {
        timestamp: new Date().toISOString(),
        currency: "USD"
      }
    })
  } catch (error) {
    console.error('Error in GET /api/deals/pipeline:', error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline summary", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}