import { supabase } from '../supabase/client';
import type { DealConversation, DealAiSuggestion } from '../types';

// Define the structure for conversation service operations
type ConversationFilter = {
  dealId?: string;
  limit?: number;
  offset?: number;
};

type ConversationInsert = Omit<DealConversation, 'id' | 'created_at' | 'updated_at'>;
type ConversationUpdate = Partial<Omit<DealConversation, 'id' | 'created_at' | 'created_by'>>;

type AiSuggestionInsert = Omit<DealAiSuggestion, 'id' | 'created_at'>;

export class ConversationService {
  /**
   * Get all conversations with optional filtering
   */
  async getAll(filter: ConversationFilter = {}) {
    try {
      let query = supabase
        .from('deal_conversations')
        .select('*')
        .order('date', { ascending: false });

      if (filter.dealId) {
        query = query.eq('deal_id', filter.dealId);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      const { data, error, count } = await query.returns<DealConversation[]>();

      if (error) throw error;

      return {
        data: data || [],
        count
      };
    } catch (error) {
      console.error('Error in ConversationService.getAll:', error);
      throw error;
    }
  }

  /**
   * Get a single conversation by ID
   */
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as DealConversation;
    } catch (error) {
      console.error(`Error in ConversationService.getById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async create(conversation: ConversationInsert) {
    try {
      // Ensure all required fields are present and in the correct format
      const payload = {
        ...conversation,
        // Ensure arrays are properly formatted
        participants: Array.isArray(conversation.participants) ? conversation.participants : [],
        next_steps: Array.isArray(conversation.next_steps) ? conversation.next_steps : [],
        // Add timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating conversation with payload:', payload);
      
      const { data, error } = await supabase
        .from('deal_conversations')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in conversation creation:', error);
        throw error;
      }

      return data as DealConversation;
    } catch (error) {
      console.error('Error in ConversationService.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing conversation
   */
  async update(id: string, updates: ConversationUpdate) {
    try {
      const { data, error } = await supabase
        .from('deal_conversations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data as DealConversation;
    } catch (error) {
      console.error(`Error in ConversationService.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('deal_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error in ConversationService.delete(${id}):`, error);
      throw error;
    }
  }

  /**
   * Search for similar conversations using vector similarity
   */
  async searchSimilar(embeddingVector: number[], threshold: number = 0.7, limit: number = 5) {
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
      console.error('Error in ConversationService.searchSimilar:', error);
      throw error;
    }
  }

  /**
   * Get AI suggestions for a conversation
   */
  async getAiSuggestions(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('deal_ai_suggestions')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (error) throw error;

      return data as DealAiSuggestion;
    } catch (error) {
      console.error(`Error in ConversationService.getAiSuggestions(${conversationId}):`, error);
      throw error;
    }
  }

  /**
   * Create AI suggestions for a conversation
   */
  async createAiSuggestions(suggestions: AiSuggestionInsert) {
    try {
      const { data, error } = await supabase
        .from('deal_ai_suggestions')
        .insert({
          ...suggestions,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data as DealAiSuggestion;
    } catch (error) {
      console.error('Error in ConversationService.createAiSuggestions:', error);
      throw error;
    }
  }
}