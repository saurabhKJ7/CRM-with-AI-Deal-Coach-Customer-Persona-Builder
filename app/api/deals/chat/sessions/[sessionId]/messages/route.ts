import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat.service';
import { openAIService } from '@/lib/openai-service';
import { DealService } from '@/lib/services/deal.service';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Directly use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('deal_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Supabase error fetching chat messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat messages', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }
    
    // Save user message - directly use supabaseAdmin to bypass RLS
    const { data: userMessage, error: userMessageError } = await supabaseAdmin
      .from('deal_chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: 'user',
        content
      })
      .select('*')
      .single();
      
    if (userMessageError) {
      console.error('Supabase error adding user message:', userMessageError);
      throw userMessageError;
    }
    
    // Get session to find deal
    const session = await chatService.getSessionWithMessages(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Get deal data for context
    const dealService = new DealService();
    const deal = await dealService.getById(session.deal_id);
    
    // Generate AI response
    const aiResponse = await openAIService.generateCoachingResponse(content, deal);
    
    // Save AI response - directly use supabaseAdmin to bypass RLS
    const { data: aiMessage, error: aiMessageError } = await supabaseAdmin
      .from('deal_chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: 'ai',
        content: aiResponse
      })
      .select('*')
      .single();
      
    if (aiMessageError) {
      console.error('Supabase error adding AI message:', aiMessageError);
      throw aiMessageError;
    }
    
    return NextResponse.json({
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: (error as Error).message },
      { status: 500 }
    );
  }
}
