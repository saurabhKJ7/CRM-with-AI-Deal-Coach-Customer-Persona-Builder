-- Create a table for AI suggestions based on deal conversations
CREATE TABLE IF NOT EXISTS public.deal_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.deal_conversations(id) ON DELETE CASCADE,
  next_steps TEXT[],
  key_points TEXT[],
  objections_identified TEXT[],
  sentiment_analysis TEXT,
  follow_up_questions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_deal_ai_suggestions_conversation_id ON public.deal_ai_suggestions(conversation_id);

-- Add RLS policies for security
ALTER TABLE public.deal_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow access to authenticated users 
CREATE POLICY "Authenticated users can view deal AI suggestions" 
ON public.deal_ai_suggestions FOR SELECT 
TO authenticated USING (true);

-- Allow service role to insert and update
CREATE POLICY "Service role can insert deal AI suggestions" 
ON public.deal_ai_suggestions FOR INSERT 
TO service_role USING (true);

CREATE POLICY "Service role can update deal AI suggestions" 
ON public.deal_ai_suggestions FOR UPDATE 
TO service_role USING (true);