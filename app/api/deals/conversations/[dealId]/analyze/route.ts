import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/services/conversation.service'
import { DealService } from '@/lib/services/deal.service'
import { openAIService } from '@/lib/openai-service'

const conversationService = new ConversationService()
const dealService = new DealService()

// POST /api/deals/conversations/:dealId/analyze
export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const conversationId = params.dealId;
    
    // Get the conversation
    const conversation = await conversationService.getById(conversationId);
    
    // Get the deal associated with the conversation
    const deal = await dealService.getById(conversation.deal_id);
    
    // Generate embedding for vector search if it doesn't exist
    if (!conversation.embedding) {
      const textForEmbedding = `
        ${conversation.summary}
        ${conversation.detailed_notes || ''}
        ${conversation.next_steps?.join(', ') || ''}
      `;
      
      const embedding = await openAIService.createEmbedding(textForEmbedding);
      
      if (embedding) {
        await conversationService.update(conversationId, {
          embedding: embedding
        });
      }
    }
    
    // Analyze the conversation and generate AI suggestions
    const analysis = await openAIService.analyzeConversation(conversation, deal);
    
    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
