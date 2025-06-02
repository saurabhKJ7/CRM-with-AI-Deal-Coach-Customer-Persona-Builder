import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation.service'

const conversationService = new ConversationService()

// GET /api/deals/conversations/:dealId
export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const conversationId = params.dealId;
    const conversation = await conversationService.getById(conversationId);
    
    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/deals/conversations/:dealId
export async function PUT(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const conversationId = params.dealId;
    const data = await request.json();
    
    const conversation = await conversationService.update(conversationId, data);
    
    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to update conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/deals/conversations/:dealId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const conversationId = params.dealId;
    await conversationService.delete(conversationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to delete conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
