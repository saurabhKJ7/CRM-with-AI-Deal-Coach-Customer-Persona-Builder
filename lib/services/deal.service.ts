import { supabase } from '../supabase/client';

// Define basic types for the deal service
type Deal = {
  id: string;
  name: string;  // Changed from 'title' to 'name' to match database schema
  title?: string; // Optional title field for backward compatibility
  description: string | null;
  amount: number | null;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type DealInsert = Omit<Deal, 'id' | 'created_at' | 'updated_at'>;
type DealUpdate = Partial<Omit<Deal, 'id' | 'created_at' | 'created_by'>> & {
  updated_at?: string;
};

export class DealService {
  private supabase = supabase;

  /**
   * Get all deals with optional filtering and pagination
   */
  async getAll({
    stage,
    contactId,
    companyId,
    assignedTo,
    page = 1,
    pageSize = 50,  // Increased page size to ensure all deals are returned
  }: {
    stage?: string;
    contactId?: string;
    companyId?: string;
    assignedTo?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    console.log(`Fetching deals with pagination: ${from}-${to}, stage filter: ${stage || 'all'}`);

    let query = this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (stage) {
      query = query.eq('stage', stage);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deals:', error);
      throw new Error('Failed to fetch deals');
    }

    // Log deals by stage to help with debugging
    const stageCount = {};
    data?.forEach(deal => {
      stageCount[deal.stage] = (stageCount[deal.stage] || 0) + 1;
    });
    console.log(`Fetched ${data?.length || 0} deals with stage distribution:`, stageCount);

    return { data, count };
  }

  /**
   * Get a single deal by ID with related contact and company data
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching deal ${id}:`, error);
      throw new Error('Deal not found');
    }

    return data;
  }

  /**
   * Get a deal with all related data (contact, company, activities, notes)
   */
  async getWithRelations(id: string) {
    try {
      // Get the deal with contact and company data
      const deal = await this.getById(id);
      
      // Get related activities
      const { data: activities, error: activitiesError } = await this.supabase
        .from('activities')
        .select('*')
        .eq('deal_id', id)
        .order('due_date', { ascending: true });
        
      if (activitiesError) throw new Error('Failed to fetch related activities');
      
      // Get related notes
      const { data: notes, error: notesError } = await this.supabase
        .from('notes')
        .select('*')
        .eq('deal_id', id)
        .order('created_at', { ascending: false });
        
      if (notesError) throw new Error('Failed to fetch related notes');
      
      return {
        ...deal,
        activities,
        notes
      };
    } catch (error) {
      console.error(`Error fetching deal with relations ${id}:`, error);
      throw new Error('Failed to fetch deal with relations');
    }
  }

  /**
   * Create a new deal
   */
  async create(deal: DealInsert) {
    // Ensure we have the name field (required by database)
    // If title is provided but name isn't, use title as name
    const processedDeal = {
      ...deal,
      name: deal.name || deal.title || ''
    };
    
    try {
      const { data, error } = await this.supabase
        .from('deals')
        .insert(processedDeal)
        .select()
        .single();

      if (error) {
        console.error('Error creating deal:', error);
        throw new Error(`Failed to create deal: ${error.message}`);
      }

      return data;
    } catch (e) {
      console.error('Exception during deal creation:', e);
      throw e;
    }
  }

  /**
   * Update an existing deal
   */
  async update(id: string, updates: DealUpdate) {
    console.log(`Updating deal ${id} with:`, updates);
    
    // Log current deal state before update
    const { data: currentDeal } = await this.supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();
      
    console.log(`Current deal state:`, currentDeal);
    
    // Handle title/name mapping
    const processedUpdates = {
      ...updates,
      // If title is provided but name isn't, use title as name
      name: updates.name || updates.title || currentDeal?.name,
      updated_at: new Date().toISOString()
    };
    
    console.log(`Processed update payload:`, processedUpdates);
    
    const { data, error } = await this.supabase
      .from('deals')
      .update(processedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating deal ${id}:`, error);
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    console.log(`Deal updated successfully:`, data);
    return data;
  }

  /**
   * Delete a deal
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting deal ${id}:`, error);
      throw new Error('Failed to delete deal');
    }

    return true;
  }

  /**
   * Get deals by stage
   */
  async getByStage(stage: Deal['stage']) {
    console.log(`Fetching deals for stage: ${stage}`);
    
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .eq('stage', stage)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching deals for stage ${stage}:`, error);
      throw new Error('Failed to fetch deals by stage');
    }

    console.log(`Found ${data?.length || 0} deals in stage ${stage}:`, data);
    return data;
  }

  /**
   * Get deals by contact
   */
  async getByContact(contactId: string) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching deals for contact ${contactId}:`, error);
      throw new Error('Failed to fetch deals by contact');
    }

    return data;
  }

  /**
   * Get deals by company
   */
  async getByCompany(companyId: string) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching deals for company ${companyId}:`, error);
      throw new Error('Failed to fetch deals by company');
    }

    return data;
  }

  /**
   * Get pipeline summary (deals count and total value by stage)
   */
  async getPipelineSummary() {
    const { data, error } = await this.supabase
      .from('deals')
      .select('stage, amount');

    if (error) {
      console.error('Error fetching pipeline summary:', error);
      throw new Error('Failed to fetch pipeline summary');
    }

    const summary = data.reduce((acc: Record<string, { count: number; value: number }>, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = { count: 0, value: 0 };
      }
      acc[deal.stage].count += 1;
      acc[deal.stage].value += deal.amount || 0;
      return acc;
    }, {});

    return summary;
  }

  /**
   * Update deal stage
   */
  async updateStage(id: string, stage: Deal['stage']) {
    console.log(`Updating stage for deal ${id} to ${stage}`);
    
    // First verify the deal exists
    const { data: existingDeal } = await this.supabase
      .from('deals')
      .select('id, stage')
      .eq('id', id)
      .single();
      
    console.log(`Existing deal before stage update:`, existingDeal);
    
    // Update with the new stage
    const result = await this.update(id, { 
      stage,
      // Add a timestamp to ensure we can detect recent changes
      updated_at: new Date().toISOString()
    });
    
    console.log(`Stage update result:`, result);
    
    // Verify the update worked
    const { data: verifiedDeal } = await this.supabase
      .from('deals')
      .select('id, stage')
      .eq('id', id)
      .single();
      
    console.log(`Verified deal after stage update:`, verifiedDeal);
    
    return result;
  }

  /**
   * Get deals assigned to a user
   */
  async getByAssignee(userId: string) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching deals for user ${userId}:`, error);
      throw new Error('Failed to fetch deals by assignee');
    }

    return data;
  }

  /**
   * Get top deals by value
   */
  async getTopDeals(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .not('stage', 'eq', 'lost')  // Fixed incorrect syntax for filtering out lost deals
      .order('amount', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top deals:', error);
      throw new Error('Failed to fetch top deals');
    }

    return data;
  }

  /**
   * Get recently modified deals
   */
  async getRecentDeals(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*, contacts(*), companies(*)')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent deals:', error);
      throw new Error('Failed to fetch recent deals');
    }

    return data;
  }

  /**
   * Get total deal value by stage
   */
  async getTotalValueByStage() {
    const { data, error } = await this.supabase
      .from('deals')
      .select('stage, amount');

    if (error) {
      console.error('Error fetching deal values by stage:', error);
      throw new Error('Failed to fetch deal values');
    }

    const valueByStage = data.reduce((acc: Record<string, number>, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = 0;
      }
      acc[deal.stage] += deal.amount || 0;
      return acc;
    }, {});

    return valueByStage;
  }
}