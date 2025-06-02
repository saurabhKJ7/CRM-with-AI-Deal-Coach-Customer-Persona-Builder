import { type NextRequest, NextResponse } from "next/server"
import { ActivityService } from "@/lib/services/activity.service"

const activityService = new ActivityService()

export async function GET(request: NextRequest) {
  try {
    const summary = await activityService.getSummary()
    
    // Calculate overall totals
    const totalActivities = Object.values(summary).reduce((acc, item) => acc + item.total, 0)
    const totalCompleted = Object.values(summary).reduce((acc, item) => acc + item.completed, 0)
    const completionRate = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0
    
    return NextResponse.json({
      data: summary,
      metadata: {
        totalActivities,
        totalCompleted,
        completionRate,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in GET /api/activities/summary:', error)
    return NextResponse.json(
      { error: "Failed to fetch activity summary", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}