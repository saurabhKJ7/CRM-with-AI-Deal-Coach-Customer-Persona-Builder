-- Create deal win-loss analysis table
CREATE TABLE deal_win_loss_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL,
  analysis_type VARCHAR NOT NULL CHECK (analysis_type IN ('win', 'loss')),
  
  -- Form input fields
  decision_maker_role VARCHAR,
  competing_solutions TEXT,
  budget_constraints BOOLEAN DEFAULT false,
  budget_notes TEXT,
  timeline_pressure VARCHAR,
  key_factors TEXT[],
  missing_features TEXT[],
  
  -- AI generated content
  ai_analysis TEXT,
  
  -- Simple tracking fields without auth dependencies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE deal_win_loss_analysis DISABLE ROW LEVEL SECURITY;
