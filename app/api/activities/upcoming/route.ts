import { type NextRequest, NextResponse } from "next/server"
import { ActivityService } from "@/lib/services/activity.service"

const activityService = new ActivityService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")
    
    const activities = await activityService.getUpcoming(days)
    
    return NextResponse.json({
      data: activities,
      metadata: {
        days,
        count: activities.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in GET /api/activities/upcoming:', error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming activities", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}