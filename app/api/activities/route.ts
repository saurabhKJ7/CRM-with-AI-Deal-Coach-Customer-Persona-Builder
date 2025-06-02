import { type NextRequest, NextResponse } from "next/server"
import { ActivityService } from "@/lib/services/activity.service"

const activityService = new ActivityService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as any
    const completed = searchParams.get("completed") === "true" ? true : 
                     searchParams.get("completed") === "false" ? false : undefined
    const priority = searchParams.get("priority") as any
    const contactId = searchParams.get("contactId") || undefined
    const dealId = searchParams.get("dealId") || undefined
    const assignedTo = searchParams.get("assignedTo") || undefined
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    
    console.log('GET /api/activities query params:', { 
      type, completed, priority, contactId, dealId, assignedTo, page, pageSize 
    })

    const { data: activities, count } = await activityService.getAll({
      type,
      completed,
      priority,
      contactId,
      dealId,
      assignedTo,
      page,
      pageSize,
    })
    
    console.log(`Fetched ${activities?.length || 0} activities out of ${count || 0} total`)

    return NextResponse.json({ 
      data: activities,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      }
    })
  } catch (error) {
    console.error('Error in GET /api/activities:', error)
    return NextResponse.json(
      { error: "Failed to fetch activities", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process and validate the activity data
    const processedBody = {
      ...body,
      subject: body.subject || 'Untitled Activity',
      type: ['call', 'email', 'meeting', 'task'].includes(body.type) ? body.type : 'task',
      due_date: body.due_date || null,
      completed: body.completed === true,
      priority: ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium',
      description: body.description || null,
      // Validate UUIDs for foreign keys
      contact_id: body.contact_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.contact_id) ? body.contact_id : null,
      deal_id: body.deal_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.deal_id) ? body.deal_id : null,
    }
    
    // Add dummy UUID for created_by and assigned_to (until auth is implemented)
    const dummyUuid = '00000000-0000-0000-0000-000000000000'
    const activityData = {
      ...processedBody,
      created_by: dummyUuid,
      assigned_to: processedBody.assigned_to && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processedBody.assigned_to) ? 
        processedBody.assigned_to : dummyUuid,
    }
    
    console.log('Creating activity with data:', activityData)
    const activity = await activityService.create(activityData)
    console.log('Activity created successfully:', activity)
    
    return NextResponse.json({ data: activity }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/activities:', error)
    return NextResponse.json(
      { error: "Failed to create activity", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}