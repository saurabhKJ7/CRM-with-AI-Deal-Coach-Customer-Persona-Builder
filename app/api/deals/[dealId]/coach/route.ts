import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '@/lib/openai-service';
import { generateAIResponse } from '@/lib/services/ai.service';
import { DealService } from '@/lib/services/deal.service';
import { directConversationService } from '@/lib/services/direct-conversation.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    const { message, isEndingConversation = false } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // If this is an end message like 'bye' or 'end', provide a closing response
    let aiResponse = '';
    if (isEndingConversation) {
      aiResponse = "Thank you for the conversation. Your chat has been saved. Feel free to start a new conversation anytime you need assistance with this deal.";
    } else {
      // Get deal data for context
      const dealService = new DealService();
      const deal = await dealService.getById(dealId);
      
      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }
      
      // Generate AI response
      aiResponse = await openAIService.generateCoachingResponse(message, deal);
    }
    
    // Save the conversation to the database
    try {
      const savedConversation = await directConversationService.saveConversation(
        dealId,
        message,
        aiResponse
      );
      
      // Extract the user and AI messages
      const userMessage = savedConversation.messages.find(m => m.sender_type === 'user');
      const aiMessage = savedConversation.messages.find(m => m.sender_type === 'ai');
      
      return NextResponse.json({
        data: {
          id: savedConversation.sessionId,
          userMessage: userMessage || {
            id: 'temp-user',
            content: message,
            sender_type: 'user',
            created_at: new Date().toISOString()
          },
          aiMessage: aiMessage || {
            id: 'temp-ai',
            content: aiResponse,
            sender_type: 'ai',
            created_at: new Date().toISOString()
          }
        }
      });
    } catch (dbError) {
      console.error('Error saving conversation:', dbError);
      
      // Even if saving fails, still return the generated response
      return NextResponse.json({
        data: {
          userMessage: {
            id: 'temp-user',
            content: message,
            sender_type: 'user',
            created_at: new Date().toISOString()
          },
          aiMessage: {
            id: 'temp-ai',
            content: aiResponse,
            sender_type: 'ai',
            created_at: new Date().toISOString()
          }
        },
        warning: 'Generated response was not saved to database'
      });
    }
  } catch (error) {
    console.error('Error generating AI coaching response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI coaching response', details: (error as Error).message },
      { status: 500 }
    );
  }
}
