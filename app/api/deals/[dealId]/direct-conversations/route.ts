import { NextRequest, NextResponse } from 'next/server';
import { directConversationService } from '@/lib/services/direct-conversation.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    
    // Get conversations for this deal
    const conversations = await directConversationService.getConversationsByDealId(dealId);
    
    // Format the conversations for the frontend
    const formattedConversations = conversations.map(conversation => {
      const messages = conversation.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_type,
        created_at: msg.created_at
      }));
      
      return {
        id: conversation.sessionId,
        messages
      };
    });
    
    return NextResponse.json({ data: formattedConversations });
  } catch (error) {
    console.error('Error fetching deal conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal conversations', details: (error as Error).message },
      { status: 500 }
    );
  }
}
