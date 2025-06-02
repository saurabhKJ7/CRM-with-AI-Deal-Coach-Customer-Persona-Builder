import { supabase } from '../supabase/client';
import { supabaseAdmin } from '../supabase/admin-client';

// Use admin client to bypass RLS in development
const db = process.env.NODE_ENV === 'production' ? supabase : supabaseAdmin;

export interface ChatSession {
  id: string;
  deal_id: string;
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface DirectConversation {
  sessionId: string;
  messages: ChatMessage[];
}

export const directConversationService = {
  // Create a new session
  async createSession(dealId: string, title: string): Promise<ChatSession> {
    // Use a dummy user ID for now
    const dummyUserId = '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await db
      .from('deal_chat_sessions')
      .insert({
        deal_id: dealId,
        title: title,
        created_by: dummyUserId
      })
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Save a conversation (creates a session and adds messages)
  async saveConversation(dealId: string, userMessage: string, aiResponse: string): Promise<DirectConversation> {
    // Create a session first
    const session = await this.createSession(dealId, `AI Coach ${new Date().toLocaleString()}`);
    
    // Add user message
    const { data: userMessageData, error: userError } = await db
      .from('deal_chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'user',
        content: userMessage
      })
      .select('*')
      .single();
      
    if (userError) throw userError;
    
    // Add AI response
    const { data: aiMessageData, error: aiError } = await db
      .from('deal_chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'ai',
        content: aiResponse
      })
      .select('*')
      .single();
      
    if (aiError) throw aiError;
    
    return {
      sessionId: session.id,
      messages: [userMessageData, aiMessageData]
    };
  },
  
  // Get conversations for a deal
  async getConversationsByDealId(dealId: string): Promise<DirectConversation[]> {
    // Get all sessions for this deal
    const { data: sessions, error: sessionError } = await db
      .from('deal_chat_sessions')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
      
    if (sessionError) throw sessionError;
    if (!sessions || sessions.length === 0) return [];
    
    // Get messages for each session
    const conversations: DirectConversation[] = [];
    
    for (const session of sessions) {
      const { data: messages, error: messagesError } = await db
        .from('deal_chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      conversations.push({
        sessionId: session.id,
        messages: messages || []
      });
    }
    
    return conversations;
  },
  
  // Add a message to an existing session
  async addMessage(sessionId: string, content: string, senderType: 'user' | 'ai'): Promise<ChatMessage> {
    const { data, error } = await db
      .from('deal_chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: senderType,
        content: content
      })
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get messages for a session
  async getMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await db
      .from('deal_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  }
};
