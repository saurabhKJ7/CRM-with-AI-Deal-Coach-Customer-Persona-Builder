import type { DealConversation, DealAiSuggestion } from "./types";
import { supabase } from "./supabase/client";

// Deal Conversation operations
export const dealConversationsDatabase = {
  getAll: async (): Promise<DealConversation[]> => {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  },

  getByDealId: async (dealId: string): Promise<DealConversation[]> => {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .select('*')
        .eq('deal_id', dealId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching conversations for deal ${dealId}:`, error);
      return [];
    }
  },

  getById: async (id: string): Promise<DealConversation | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      return null;
    }
  },

  create: async (conversation: Partial<DealConversation>): Promise<DealConversation | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .insert(conversation)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<DealConversation>): Promise<DealConversation | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('deal_conversations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
      return false;
    }
  },

  // Vector similarity search
  searchSimilar: async (embeddingVector: number[], threshold: number = 0.7, limit: number = 5): Promise<any[]> => {
    try {
      const { data, error } = await supabase.rpc(
        'match_deal_conversations',
        {
          query_embedding: embeddingVector,
          match_threshold: threshold,
          match_count: limit
        }
      );
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error performing similarity search:", error);
      return [];
    }
  }
};

// AI Suggestions for Deal Conversations
export const dealAiSuggestionsDatabase = {
  getByConversationId: async (conversationId: string): Promise<DealAiSuggestion | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_ai_suggestions')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching AI suggestions for conversation ${conversationId}:`, error);
      return null;
    }
  },

  create: async (suggestion: Partial<DealAiSuggestion>): Promise<DealAiSuggestion | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_ai_suggestions')
        .insert(suggestion)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating AI suggestion:", error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<DealAiSuggestion>): Promise<DealAiSuggestion | null> => {
    try {
      const { data, error } = await supabase
        .from('deal_ai_suggestions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating AI suggestion ${id}:`, error);
      return null;
    }
  }
};