import { type NextRequest, NextResponse } from "next/server"
import { ContactService } from "@/lib/services/contact.service"

const contactService = new ContactService()

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const contact = await contactService.getWithRelations(id)
    
    return NextResponse.json({
      data: contact,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error(`Error in GET /api/contacts/${context.params.id}/relations:`, error)
    return NextResponse.json(
      { 
        error: "Failed to fetch contact with relations",
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}