import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat.service';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    
    // Directly use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('deal_chat_sessions')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error fetching chat sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat sessions', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    const { title, createdBy } = await request.json();
    
    if (!createdBy) {
      return NextResponse.json(
        { error: 'Missing required field: createdBy' },
        { status: 400 }
      );
    }
    
    // Directly use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('deal_chat_sessions')
      .insert({
        deal_id: dealId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        created_by: createdBy
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Supabase error creating chat session:', error);
      return NextResponse.json(
        { error: 'Failed to create chat session', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session', details: (error as Error).message },
      { status: 500 }
    );
  }
}
