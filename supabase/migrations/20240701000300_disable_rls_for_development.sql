-- Disable RLS for development purposes
-- WARNING: This should only be used in development environments

-- Disable RLS on chat sessions table
ALTER TABLE public.deal_chat_sessions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on chat messages table
ALTER TABLE public.deal_chat_messages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customer personas table
ALTER TABLE public.customer_personas DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable these in production with:
-- ALTER TABLE public.deal_chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.deal_chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;
