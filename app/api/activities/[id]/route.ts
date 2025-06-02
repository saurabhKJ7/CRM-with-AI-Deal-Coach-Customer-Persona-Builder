import { type NextRequest, NextResponse } from "next/server"
import { ActivityService } from "@/lib/services/activity.service"

const activityService = new ActivityService()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activity = await activityService.getById(params.id)
    return NextResponse.json({ data: activity })
  } catch (error) {
    console.error(`Error in GET /api/activities/${params.id}:`, error)
    if (error instanceof Error && error.message === 'Activity not found') {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to fetch activity", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const activity = await activityService.update(params.id, body)
    return NextResponse.json({ data: activity })
  } catch (error) {
    console.error(`Error in PUT /api/activities/${params.id}:`, error)
    if (error instanceof Error && error.message === 'Activity not found') {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to update activity", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await activityService.delete(params.id)
    return NextResponse.json({ message: "Activity deleted successfully" })
  } catch (error) {
    console.error(`Error in DELETE /api/activities/${params.id}:`, error)
    if (error instanceof Error && error.message === 'Activity not found') {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to delete activity", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}