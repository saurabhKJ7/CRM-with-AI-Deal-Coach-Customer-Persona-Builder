-- Create a table for deal chat sessions
CREATE TABLE IF NOT EXISTS public.deal_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on deal_id for faster queries
CREATE INDEX IF NOT EXISTS idx_deal_chat_sessions_deal_id ON public.deal_chat_sessions(deal_id);

-- Create a table for chat messages
CREATE TABLE IF NOT EXISTS public.deal_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.deal_chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_deal_chat_messages_session_id ON public.deal_chat_messages(session_id);

-- Add RLS policies for security
ALTER TABLE public.deal_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_chat_messages ENABLE ROW LEVEL SECURITY;



-- Create a trigger to automatically update the updated_at column for chat sessions
CREATE TRIGGER update_deal_chat_sessions_updated_at
BEFORE UPDATE ON public.deal_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
