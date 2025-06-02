import { supabase } from '../supabase/client';
import { supabaseAdmin } from '../supabase/admin-client';

// Define basic types for the contact service
type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
  status: string | null;
  source: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  tags?: string[] | null;
  companies?: {
    id: string;
    name: string;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
  } | null;
};

type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
type ContactUpdate = Partial<Omit<Contact, 'id' | 'created_at' | 'created_by'>> & {
  updated_at?: string;
};

export class ContactService {
  private supabase = supabase;

  /**
   * Get all contacts with optional filtering and pagination
   */
  async getAll({
    search,
    status,
    source,
    page = 1,
    pageSize = 20,
  }: {
    search?: string;
    status?: string;
    source?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('contacts')
      .select('*, companies(*)')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }

    return { data, count };
  }

  /**
   * Get a single contact by ID with related company data
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*, companies(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw new Error('Contact not found');
    }

    return data;
  }

  /**
   * Get deals related to a contact
   */
  async getRelatedDeals(contactId: string) {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching deals for contact ${contactId}:`, error);
      throw new Error('Failed to fetch related deals');
    }

    return data;
  }

  /**
   * Get activities related to a contact
   */
  async getRelatedActivities(contactId: string) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error(`Error fetching activities for contact ${contactId}:`, error);
      throw new Error('Failed to fetch related activities');
    }

    return data;
  }

  /**
   * Get notes related to a contact
   */
  async getRelatedNotes(contactId: string) {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching notes for contact ${contactId}:`, error);
      throw new Error('Failed to fetch related notes');
    }

    return data;
  }

  /**
   * Get a contact with all related data (deals, activities, notes)
   */
  async getWithRelations(id: string) {
    try {
      const contact = await this.getById(id);
      const deals = await this.getRelatedDeals(id);
      const activities = await this.getRelatedActivities(id);
      const notes = await this.getRelatedNotes(id);

      return {
        ...contact,
        deals,
        activities,
        notes
      };
    } catch (error) {
      console.error(`Error fetching contact with relations ${id}:`, error);
      throw new Error('Failed to fetch contact with relations');
    }
  }

  /**
   * Create a new contact
   */
  async create(contact: ContactInsert) {
    try {
      console.log('Creating contact with data:', contact);
      
      // Ensure all required fields are present
      if (!contact.first_name || !contact.last_name) {
        throw new Error('First name and last name are required');
      }
      
      // Create a sanitized copy of the contact data
      const sanitizedContact = { ...contact };
      
      // Ensure UUID fields are properly formatted
      if (!sanitizedContact.created_by) {
        sanitizedContact.created_by = '00000000-0000-0000-0000-000000000000';
      }
      
      if (!sanitizedContact.assigned_to) {
        sanitizedContact.assigned_to = '00000000-0000-0000-0000-000000000000';
      }
      
      // Handle company_id - first verify it exists in the database
      if (sanitizedContact.company_id) {
        // Check if it's a valid UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedContact.company_id)) {
          console.warn(`Invalid UUID format for company_id: ${sanitizedContact.company_id}, setting to null`);
          sanitizedContact.company_id = null;
        } else {
          // Verify the company exists in the database to avoid foreign key constraint errors
          try {
            const { data: companyData, error: companyError } = await this.supabase
              .from('companies')
              .select('id')
              .eq('id', sanitizedContact.company_id)
              .single();
            
            if (companyError || !companyData) {
              console.warn(`Company ID ${sanitizedContact.company_id} not found in database, setting to null`);
              sanitizedContact.company_id = null;
            } else {
              console.log(`Verified company_id exists: ${sanitizedContact.company_id}`);
            }
          } catch (companyCheckError) {
            console.error('Error checking company existence:', companyCheckError);
            sanitizedContact.company_id = null;
          }
        }
      }
      
      // Simple approach matching the deals implementation
      const { data, error } = await this.supabase
        .from('contacts')
        .insert(sanitizedContact)
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw new Error(`Failed to create contact: ${error.message}`);
      }
      
      console.log('Contact created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in ContactService.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing contact
   */
  async update(id: string, updates: ContactUpdate) {
    const { data, error } = await this.supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw new Error('Failed to update contact');
    }

    return data;
  }

  /**
   * Delete a contact
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw new Error('Failed to delete contact');
    }

    return true;
  }

  /**
   * Merge duplicate contacts
   */
  async mergeContacts(primaryId: string, duplicateIds: string[]) {
    // Start a transaction
    const { data: primaryContact, error: fetchError } = await this.supabase.rpc('merge_contacts', {
      primary_contact_id: primaryId,
      duplicate_contact_ids: duplicateIds,
    });

    if (fetchError) {
      console.error('Error merging contacts:', fetchError);
      throw new Error('Failed to merge contacts');
    }

    return primaryContact;
  }

  /**
   * Add tags to a contact
   */
  async addTags(contactId: string, tags: string[]) {
    const { data, error } = await this.supabase.rpc('add_contact_tags', {
      contact_id: contactId,
      tags,
    });

    if (error) {
      console.error(`Error adding tags to contact ${contactId}:`, error);
      throw new Error('Failed to add tags');
    }

    return data;
  }

  /**
   * Remove tags from a contact
   */
  async removeTags(contactId: string, tags: string[]) {
    const { data, error } = await this.supabase.rpc('remove_contact_tags', {
      contact_id: contactId,
      tags,
    });

    if (error) {
      console.error(`Error removing tags from contact ${contactId}:`, error);
      throw new Error('Failed to remove tags');
    }

    return data;
  }

  /**
   * Get all unique status values for filtering
   */
  async getStatusOptions() {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('status')
      .not('status', 'is', null)
      .order('status');

    if (error) {
      console.error('Error fetching status options:', error);
      return [];
    }

    const statuses = data.map((item: { status: string }) => item.status);
    return Array.from(new Set(statuses));
  }

  /**
   * Get all unique source values for filtering
   */
  async getSourceOptions() {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('source')
      .not('source', 'is', null)
      .order('source');

    if (error) {
      console.error('Error fetching source options:', error);
      return [];
    }

    const sources = data.map((item: { source: string }) => item.source);
    return Array.from(new Set(sources));
  }
}