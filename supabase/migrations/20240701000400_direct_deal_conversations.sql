-- Create a table for direct deal conversations
CREATE TABLE IF NOT EXISTS public.direct_deal_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on deal_id for faster queries
CREATE INDEX IF NOT EXISTS idx_direct_deal_conversations_deal_id ON public.direct_deal_conversations(deal_id);

-- Disable RLS for development
ALTER TABLE public.direct_deal_conversations DISABLE ROW LEVEL SECURITY;
