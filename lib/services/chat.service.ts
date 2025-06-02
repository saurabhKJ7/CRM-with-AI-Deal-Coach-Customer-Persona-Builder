import { supabase } from '../supabase/client';
import { supabaseAdmin } from '../supabase/admin-client';

// Use admin client to bypass RLS in development
const db = process.env.NODE_ENV === 'production' ? supabase : supabaseAdmin;
import { DealChatSession, DealChatMessage, DealChatSessionWithMessages } from '../types';

export const chatService = {
  // Create a new chat session
  async createSession(dealId: string, createdBy: string, title?: string): Promise<DealChatSession> {
    const { data, error } = await db
      .from('deal_chat_sessions')
      .insert({
        deal_id: dealId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        created_by: createdBy
      })
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get sessions for a deal
  async getSessionsByDealId(dealId: string): Promise<DealChatSession[]> {
    const { data, error } = await db
      .from('deal_chat_sessions')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  // Get a specific session
  async getSessionById(sessionId: string): Promise<DealChatSession | null> {
    const { data, error } = await db
      .from('deal_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    return data;
  },
  
  // Add a message to a session
  async addMessage(sessionId: string, senderType: 'user' | 'ai', content: string): Promise<DealChatMessage> {
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
  async getMessagesBySessionId(sessionId: string): Promise<DealChatMessage[]> {
    const { data, error } = await db
      .from('deal_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  // Get a session with all its messages
  async getSessionWithMessages(sessionId: string): Promise<DealChatSessionWithMessages | null> {
    const session = await this.getSessionById(sessionId);
    if (!session) return null;
    
    const messages = await this.getMessagesBySessionId(sessionId);
    
    return {
      ...session,
      messages
    };
  },
  
  // Update session title
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await db
      .from('deal_chat_sessions')
      .update({ title })
      .eq('id', sessionId);
      
    if (error) throw error;
  },
  
  // Delete a session and all its messages
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await db
      .from('deal_chat_sessions')
      .delete()
      .eq('id', sessionId);
      
    if (error) throw error;
  }
};
