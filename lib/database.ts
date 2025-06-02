}

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
}

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
}

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
}

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
}

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
}

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
}
import { supabase } from "./supabase/client"

// Contacts operations
export const contactsDatabase = {
  getAll: async (): Promise<Contact[]> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*, companies(*)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Contact | null> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*, companies(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      return null;
    }
  },

  create: async (contact: Partial<Contact>): Promise<Contact | null> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating contact:", error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Contact>): Promise<Contact | null> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      return false;
    }
  },

  search: async (query: string): Promise<Contact[]> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*, companies(*)')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  },
}

// Deal operations
export const dealsDatabase = {
  getAll: async (): Promise<Deal[]> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(*), companies(*)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching deals:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(*), companies(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error);
      return null;
    }
  },

  create: async (deal: Partial<Deal>): Promise<Deal | null> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert(deal)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating deal:", error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Deal>): Promise<Deal | null> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating deal ${id}:`, error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting deal ${id}:`, error);
      return false;
    }
  },

  getByStage: async (stage: Deal["stage"]): Promise<Deal[]> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(*), companies(*)')
        .eq('stage', stage)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching deals for stage ${stage}:`, error);
      return [];
    }
  },
}

// Activity operations
export const activitiesDatabase = {
  getAll: async (): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(*), deals(*)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Activity | null> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(*), deals(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  },

  create: async (activity: Partial<Activity>): Promise<Activity | null> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating activity:", error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Activity>): Promise<Activity | null> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating activity ${id}:`, error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting activity ${id}:`, error);
      return false;
    }
  },

  getByContact: async (contact_id: string): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(*), deals(*)')
        .eq('contact_id', contact_id)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching activities for contact ${contact_id}:`, error);
      return [];
    }
  },

  getByDeal: async (deal_id: string): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(*), deals(*)')
        .eq('deal_id', deal_id)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching activities for deal ${deal_id}:`, error);
      return [];
    }
  },
}