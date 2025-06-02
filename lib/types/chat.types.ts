// Chat types for the Deal Coach AI feature

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
