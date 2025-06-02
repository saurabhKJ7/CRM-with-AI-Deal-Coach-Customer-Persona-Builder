import { type NextRequest, NextResponse } from "next/server"
import { ContactService } from "@/lib/services/contact.service"

const contactService = new ContactService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await contactService.getById(params.id)
    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error(`Error in GET /api/contacts/${params.id}:`, error)
    return NextResponse.json(
      { 
        error: "Failed to fetch contact",
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const contact = await contactService.update(params.id, body)
    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error(`Error in PUT /api/contacts/${params.id}:`, error)
    return NextResponse.json(
      { 
        error: "Failed to update contact",
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await contactService.delete(params.id)
    return NextResponse.json({ 
      success: true,
      message: "Contact deleted successfully" 
    })
  } catch (error) {
    console.error(`Error in DELETE /api/contacts/${params.id}:`, error)
    return NextResponse.json(
      { 
        error: "Failed to delete contact",
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

// Additional endpoints for contact-related operations
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'add-tags':
        const { tags } = data
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json(
            { error: "Invalid tags data" },
            { status: 400 }
          )
        }
        const result = await contactService.addTags(params.id, tags)
        return NextResponse.json({ data: result })
        
      case 'remove-tags':
        const { tags: tagsToRemove } = data
        if (!tagsToRemove || !Array.isArray(tagsToRemove)) {
          return NextResponse.json(
            { error: "Invalid tags data" },
            { status: 400 }
          )
        }
        const removeResult = await contactService.removeTags(params.id, tagsToRemove)
        return NextResponse.json({ data: removeResult })
        
      case 'merge':
        const { duplicateIds } = data
        if (!duplicateIds || !Array.isArray(duplicateIds)) {
          return NextResponse.json(
            { error: "Invalid duplicate IDs" },
            { status: 400 }
          )
        }
        const mergeResult = await contactService.mergeContacts(params.id, duplicateIds)
        return NextResponse.json({ data: mergeResult })
        
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error(`Error in PATCH /api/contacts/${params.id}:`, error)
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}
