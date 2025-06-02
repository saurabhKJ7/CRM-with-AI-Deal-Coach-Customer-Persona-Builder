import { supabase } from '@/lib/supabase/client'

export class DealAnalysisService {
  async createAnalysis(analysisData: any) {
    
    const { data, error } = await supabase
      .from('deal_win_loss_analysis')
      .insert(analysisData)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async getAnalysisForDeal(dealId: string) {
    
    const { data, error } = await supabase
      .from('deal_win_loss_analysis')
      .select('*')
      .eq('deal_id', dealId)
      .single()
      
    if (error && error.code !== 'PGSQL_NORESULT') throw error
    return data
  }

  async getAllAnalyses() {
    
    const { data, error } = await supabase
      .from('deal_win_loss_analysis')
      .select('*, deals:deal_id(*)')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data
  }

  async getWonDeals() {
    
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('stage', 'won')
      .order('updated_at', { ascending: false })
      
    if (error) throw error
    return data
  }

  async getLostDeals() {
    
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('stage', 'lost')
      .order('updated_at', { ascending: false })
      
    if (error) throw error
    return data
  }
}
