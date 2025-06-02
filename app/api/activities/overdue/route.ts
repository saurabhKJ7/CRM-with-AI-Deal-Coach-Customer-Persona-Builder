import { type NextRequest, NextResponse } from "next/server"
import { ActivityService } from "@/lib/services/activity.service"

const activityService = new ActivityService()

export async function GET(request: NextRequest) {
  try {
    const overdueActivities = await activityService.getOverdue()
    
    return NextResponse.json({
      data: overdueActivities,
      metadata: {
        count: overdueActivities.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in GET /api/activities/overdue:', error)
    return NextResponse.json(
      { error: "Failed to fetch overdue activities", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}