import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation.service'

const conversationService = new ConversationService()

// GET /api/deals/:dealId/conversations
export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    const { data: conversations, count } = await conversationService.getAll({ dealId });
    
    return NextResponse.json({
      data: conversations,
      pagination: {
        total: count || conversations.length,
        page: 1,
        pageSize: conversations.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching deal conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/deals/:dealId/conversations
export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    const data = await request.json();
    
    // Use a dummy UUID for created_by since we don't have authentication yet
    const dummyUuid = '00000000-0000-0000-0000-000000000000';
    
    // Process the data to ensure fields match the database schema
    const processedData = {
      ...data,
      deal_id: dealId,
      created_by: data.created_by || dummyUuid, // Use provided created_by or fallback to dummy
      // Ensure next_steps is an array
      next_steps: data.next_steps ? 
        (Array.isArray(data.next_steps) ? data.next_steps : [data.next_steps]) : 
        [],
      // Ensure participants is an array
      participants: data.participants ?
        (Array.isArray(data.participants) ? data.participants : [data.participants]) :
        []
    };
    
    const conversation = await conversationService.create(processedData);
    
    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
