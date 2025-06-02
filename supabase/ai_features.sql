-- Enable the pgvector extension to support vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for deal conversations
CREATE TABLE IF NOT EXISTS public.deal_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'chat', 'other')),
  participants TEXT[],
  summary TEXT,
  detailed_notes TEXT,
  next_steps TEXT[],
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  embedding VECTOR(1536),  -- For OpenAI ada-002 embeddings
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on deal_id for faster queries
CREATE INDEX IF NOT EXISTS idx_deal_conversations_deal_id ON public.deal_conversations(deal_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_deal_conversations_updated_at ON public.deal_conversations;
CREATE TRIGGER update_deal_conversations_updated_at
BEFORE UPDATE ON public.deal_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION match_deal_conversations(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  deal_id UUID,
  date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  summary TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.deal_id,
    dc.date,
    dc.type,
    dc.summary,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.deal_conversations dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- No permissions or policies needed as authentication is not being used