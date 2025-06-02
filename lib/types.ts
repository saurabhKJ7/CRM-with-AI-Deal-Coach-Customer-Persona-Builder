// Base type for User/Profile
export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

// Core types
export type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  job_title: string | null
  company_id: string | null
  company_name: string | null
  status: string | null
  source: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  notes: string | null
  companies?: {
    id: string
    name: string
  } | null
}

export type Company = {
  id: string
  name: string
  industry: string | null
  website: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type Deal = {
  id: string
  name: string  // Changed from 'title' to 'name' to match database schema
  title?: string // Optional title field for backward compatibility
  description: string | null
  amount: number | null
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number
  expected_close_date: string | null
  contact_id: string | null
  company_id: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  subject: string
  type: 'call' | 'email' | 'meeting' | 'task'
  due_date: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  description: string | null
  contact_id: string | null
  deal_id: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  content: string
  contact_id: string | null
  deal_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Dashboard types
export type DashboardMetrics = {
  totalContacts: number
  activeDeals: number
  totalRevenue: number
  monthlyGrowth: number
  conversionRate: number
  avgDealSize: number
}

// Extended types with relationships
export type ContactWithRelations = Contact & {
  company?: Company
  deals?: Deal[]
  activities?: Activity[]
  notes?: Note[]
  assignedTo?: Profile
  createdBy: Profile
}

export type DealWithRelations = Deal & {
  contact?: Contact
  company?: Company
  activities?: Activity[]
  notes?: Note[]
  assignedTo?: Profile
  createdBy: Profile
}

export type ActivityWithRelations = Activity & {
  contact?: Contact
  deal?: Deal
  assignedTo?: Profile
  createdBy: Profile
}

// API Response types
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export type ApiResponse<T> = {
  data: T
  error?: string
}

export type ApiError = {
  error: string
  details?: string
}

// Deal Conversation types
export type DealConversation = {
  id: string
  deal_id: string
  date: string
  type: 'call' | 'email' | 'meeting' | 'chat' | 'other'
  participants: string[]
  summary: string
  detailed_notes: string | null
  next_steps: string[] | null
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | null
  embedding?: number[] // Vector representation for semantic search
  created_by: string
  created_at: string
  updated_at: string
}

export type DealConversationWithRelations = DealConversation & {
  deal?: Deal
  createdBy: Profile
  aiSuggestions?: DealAiSuggestion
}

export type DealAiSuggestion = {
  id: string
  conversation_id: string
  next_steps: string[]
  key_points: string[]
  objections_identified: string[]
  sentiment_analysis: string
  follow_up_questions: string[]
  created_at: string
}

// Deal Chat types for the Deal Coach AI feature
export type DealChatSession = {
  id: string
  deal_id: string
  title: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type DealChatMessage = {
  id: string
  session_id: string
  sender_type: 'user' | 'ai'
  content: string
  created_at: string
}

export type DealChatSessionWithMessages = DealChatSession & {
  messages: DealChatMessage[]
}