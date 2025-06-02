import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '@/lib/services/contact.service'

const contactService = new ContactService()

export async function GET(request: NextRequest) {
  console.log('GET /api/contacts called')
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50') // Increased to show more contacts
    
    console.log('Contacts list query params:', { search, status, source, page, pageSize })
    
    let result
    try {
      result = await contactService.getAll({
        search,
        status,
        source,
        page,
        pageSize,
      })
    } catch (serviceError) {
      console.error('Error in contactService.getAll:', serviceError)
      throw serviceError
    }
    
    const { data: contacts, count } = result
    
    console.log(`Fetched ${contacts?.length || 0} contacts, total count: ${count}`)
    
    // Ensure contacts is always an array, even if it's null/undefined
    const safeContacts = Array.isArray(contacts) ? contacts : []
    
    const response = {
      data: safeContacts,
      count: count || 0,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      }
    }
    
    console.log('Sending contacts response with pagination:', response.pagination)
    return NextResponse.json(response, {
      headers: {
        // Prevent caching to ensure fresh data
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Error in GET /api/contacts:', error)
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'
    console.log('Sending error response:', errorDetails)
    return NextResponse.json(
      { error: "Failed to fetch contacts", details: errorDetails },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/contacts - Request received')
    const body = await request.json()
    console.log('Request body:', body)
    
    // Ensure all required fields are present and properly formatted
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: "Validation error", details: "First name and last name are required" },
        { status: 400 }
      )
    }
    
    // Process the contact data similar to how deals are processed
    const processedBody = {
      ...body,
      // Handle empty or invalid values
      email: body.email || null,
      phone: body.phone || null,
      job_title: body.job_title || null,
      // Ensure company_id is a valid UUID or null
      company_id: body.company_id && body.company_id.trim() !== "" && 
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.company_id) ? 
                body.company_id : null,
      status: body.status || 'New',
      source: body.source || 'Manual',
      notes: body.notes || null,
    }
    
    // Add required fields with valid UUIDs since we're not doing authentication yet
    const dummyUuid = '00000000-0000-0000-0000-000000000000' // Valid UUID for testing
    
    const contactData = {
      ...processedBody,
      created_by: dummyUuid,
      assigned_to: processedBody.assigned_to || dummyUuid // Use provided assigned_to or fallback to dummy UUID
    }
    
    console.log('Processed contact data:', contactData)
    const contact = await contactService.create(contactData)
    console.log('Contact created successfully:', contact)
    
    return NextResponse.json({ data: contact }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/contacts:', error)
    return NextResponse.json(
      { 
        error: "Failed to create contact", 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}
