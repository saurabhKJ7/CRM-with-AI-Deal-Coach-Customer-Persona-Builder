import { supabase } from '../supabase/client';

// Define basic types for the activity service
type Activity = {
  id: string;
  subject: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  description: string | null;
  contact_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
type ActivityUpdate = Partial<Omit<Activity, 'id' | 'created_at' | 'created_by'>> & {
  updated_at?: string;
};

export class ActivityService {
  private supabase = supabase;

  /**
   * Get all activities with optional filtering and pagination
   */
  async getAll({
    type,
    completed,
    priority,
    contactId,
    dealId,
    assignedTo,
    page = 1,
    pageSize = 20,
  }: {
    type?: Activity['type'];
    completed?: boolean;
    priority?: Activity['priority'];
    contactId?: string;
    dealId?: string;
    assignedTo?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)', { count: 'exact' })
      .range(from, to)
      .order('due_date', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    if (completed !== undefined) {
      query = query.eq('completed', completed);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }

    return { data, count };
  }

  /**
   * Get a single activity by ID with related data
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching activity ${id}:`, error);
      throw new Error('Activity not found');
    }

    return data;
  }

  /**
   * Get an activity with all related data
   */
  async getWithRelations(id: string) {
    try {
      const activity = await this.getById(id);
      
      return activity;
    } catch (error) {
      console.error(`Error fetching activity with relations ${id}:`, error);
      throw new Error('Failed to fetch activity with relations');
    }
  }

  /**
   * Create a new activity
   */
  async create(activity: ActivityInsert) {
    try {
      console.log('Creating activity with data:', activity);
      
      // Ensure required fields are present
      if (!activity.subject) {
        throw new Error('Activity subject is required');
      }
      
      // Create a sanitized copy of the activity data
      const sanitizedActivity = { ...activity };
      
      // Ensure UUID fields are properly formatted
      if (!sanitizedActivity.created_by) {
        sanitizedActivity.created_by = '00000000-0000-0000-0000-000000000000';
      }
      
      if (!sanitizedActivity.assigned_to) {
        sanitizedActivity.assigned_to = '00000000-0000-0000-0000-000000000000';
      }
      
      // Handle contact_id - verify it exists in the database
      if (sanitizedActivity.contact_id) {
        // Check if it's a valid UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedActivity.contact_id)) {
          console.warn(`Invalid UUID format for contact_id: ${sanitizedActivity.contact_id}, setting to null`);
          sanitizedActivity.contact_id = null;
        } else {
          // Verify the contact exists in the database
          try {
            const { data: contactData, error: contactError } = await this.supabase
              .from('contacts')
              .select('id')
              .eq('id', sanitizedActivity.contact_id)
              .single();
            
            if (contactError || !contactData) {
              console.warn(`Contact ID ${sanitizedActivity.contact_id} not found in database, setting to null`);
              sanitizedActivity.contact_id = null;
            } else {
              console.log(`Verified contact_id exists: ${sanitizedActivity.contact_id}`);
            }
          } catch (contactCheckError) {
            console.error('Error checking contact existence:', contactCheckError);
            sanitizedActivity.contact_id = null;
          }
        }
      }
      
      // Handle deal_id - verify it exists in the database
      if (sanitizedActivity.deal_id) {
        // Check if it's a valid UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedActivity.deal_id)) {
          console.warn(`Invalid UUID format for deal_id: ${sanitizedActivity.deal_id}, setting to null`);
          sanitizedActivity.deal_id = null;
        } else {
          // Verify the deal exists in the database
          try {
            const { data: dealData, error: dealError } = await this.supabase
              .from('deals')
              .select('id')
              .eq('id', sanitizedActivity.deal_id)
              .single();
            
            if (dealError || !dealData) {
              console.warn(`Deal ID ${sanitizedActivity.deal_id} not found in database, setting to null`);
              sanitizedActivity.deal_id = null;
            } else {
              console.log(`Verified deal_id exists: ${sanitizedActivity.deal_id}`);
            }
          } catch (dealCheckError) {
            console.error('Error checking deal existence:', dealCheckError);
            sanitizedActivity.deal_id = null;
          }
        }
      }
      
      const { data, error } = await this.supabase
        .from('activities')
        .insert(sanitizedActivity)
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        throw new Error(`Failed to create activity: ${error.message}`);
      }
      
      console.log('Activity created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in ActivityService.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing activity
   */
  async update(id: string, updates: ActivityUpdate) {
    const { data, error } = await this.supabase
      .from('activities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating activity ${id}:`, error);
      throw new Error('Failed to update activity');
    }

    return data;
  }

  /**
   * Delete an activity
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting activity ${id}:`, error);
      throw new Error('Failed to delete activity');
    }

    return true;
  }

  /**
   * Mark an activity as completed
   */
  async complete(id: string) {
    return this.update(id, { completed: true });
  }

  /**
   * Mark an activity as incomplete
   */
  async incomplete(id: string) {
    return this.update(id, { completed: false });
  }

  /**
   * Get activities by contact
   */
  async getByContact(contactId: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error(`Error fetching activities for contact ${contactId}:`, error);
      throw new Error('Failed to fetch activities by contact');
    }

    return data;
  }

  /**
   * Get activities by deal
   */
  async getByDeal(dealId: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .eq('deal_id', dealId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error(`Error fetching activities for deal ${dealId}:`, error);
      throw new Error('Failed to fetch activities by deal');
    }

    return data;
  }

  /**
   * Get activities by user (assigned to)
   */
  async getByAssignee(userId: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error(`Error fetching activities for user ${userId}:`, error);
      throw new Error('Failed to fetch activities by assignee');
    }

    return data;
  }

  /**
   * Get upcoming activities
   */
  async getUpcoming(days: number = 7) {
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .gte('due_date', startDate)
      .lte('due_date', endDate.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming activities:', error);
      throw new Error('Failed to fetch upcoming activities');
    }

    return data;
  }

  /**
   * Get overdue activities
   */
  async getOverdue() {
    const currentDate = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .lt('due_date', currentDate)
      .eq('completed', false)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching overdue activities:', error);
      throw new Error('Failed to fetch overdue activities');
    }

    return data;
  }

  /**
   * Get today's activities
   */
  async getTodaysActivities() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching today\'s activities:', error);
      throw new Error('Failed to fetch today\'s activities');
    }

    return data;
  }

  /**
   * Get activity summary (count by type and status)
   */
  async getSummary() {
    const { data, error } = await this.supabase
      .from('activities')
      .select('type, completed');

    if (error) {
      console.error('Error fetching activity summary:', error);
      throw new Error('Failed to fetch activity summary');
    }

    const summary = data.reduce((acc: Record<string, { total: number; completed: number }>, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = { total: 0, completed: 0 };
      }
      acc[activity.type].total += 1;
      if (activity.completed) {
        acc[activity.type].completed += 1;
      }
      return acc;
    }, {});

    return summary;
  }

  /**
   * Get recent activities
   */
  async getRecent(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*, contacts(*), deals(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activities:', error);
      throw new Error('Failed to fetch recent activities');
    }

    return data;
  }

  /**
   * Get completion rate (percentage of completed activities)
   */
  async getCompletionRate() {
    const { data, error } = await this.supabase
      .from('activities')
      .select('completed');

    if (error) {
      console.error('Error fetching activities for completion rate:', error);
      throw new Error('Failed to fetch activities for completion rate');
    }

    if (data.length === 0) {
      return 0;
    }

    const completed = data.filter(activity => activity.completed).length;
    return Math.round((completed / data.length) * 100);
  }
}