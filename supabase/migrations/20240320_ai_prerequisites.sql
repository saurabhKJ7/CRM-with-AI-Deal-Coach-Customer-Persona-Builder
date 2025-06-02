-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Deal History Tracking
CREATE TABLE IF NOT EXISTS public.deal_stages_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT,
    change_reason TEXT,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_deal_stages_history_deal_id ON public.deal_stages_history(deal_id);

-- Interaction Logging
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sentiment TEXT,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_interaction_type CHECK (type IN ('email', 'call', 'meeting', 'note', 'message', 'other')),
    CONSTRAINT check_interaction_source CHECK (source IN ('manual', 'email', 'phone', 'web', 'api', 'system'))
);

CREATE INDEX idx_interactions_contact_id ON public.interactions(contact_id);
CREATE INDEX idx_interactions_deal_id ON public.interactions(deal_id);
CREATE INDEX idx_interactions_type ON public.interactions(type);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at);

-- Communication Tracking
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES public.interactions(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    recipients JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_communication_direction CHECK (direction IN ('inbound', 'outbound')),
    CONSTRAINT check_communication_channel CHECK (channel IN ('email', 'phone', 'meeting', 'chat', 'social', 'other')),
    CONSTRAINT check_communication_status CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'received', 'read'))
);

CREATE INDEX idx_communication_logs_interaction_id ON public.communication_logs(interaction_id);
CREATE INDEX idx_communication_logs_channel ON public.communication_logs(channel);
CREATE INDEX idx_communication_logs_created_at ON public.communication_logs(created_at);

-- Win/Loss Tracking
CREATE TABLE IF NOT EXISTS public.deal_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    primary_reason TEXT,
    detailed_reasons JSONB,
    competitor_id UUID,
    competitor_name TEXT,
    lost_to_competitor BOOLEAN DEFAULT FALSE,
    winning_factors TEXT[],
    losing_factors TEXT[],
    learning_points TEXT[],
    feedback TEXT,
    decision_maker_id UUID REFERENCES public.contacts(id),
    closed_amount NUMERIC(12,2),
    closed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_deal_outcome CHECK (outcome IN ('won', 'lost', 'abandoned', 'no_decision'))
);

CREATE INDEX idx_deal_outcomes_deal_id ON public.deal_outcomes(deal_id);
CREATE INDEX idx_deal_outcomes_outcome ON public.deal_outcomes(outcome);
CREATE INDEX idx_deal_outcomes_closed_at ON public.deal_outcomes(closed_at);

-- Contact Engagement Tracking
CREATE TABLE IF NOT EXISTS public.contact_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL,
    engagement_score INTEGER,
    last_interaction_date TIMESTAMPTZ,
    interaction_count INTEGER DEFAULT 0,
    response_rate NUMERIC(5,2),
    average_response_time INTERVAL,
    preferred_channel TEXT,
    active_deals_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_engagement_type CHECK (engagement_type IN ('cold', 'warm', 'hot', 'inactive'))
);

CREATE INDEX idx_contact_engagement_contact_id ON public.contact_engagement(contact_id);
CREATE INDEX idx_contact_engagement_score ON public.contact_engagement(engagement_score);
CREATE INDEX idx_contact_engagement_type ON public.contact_engagement(engagement_type);

-- Deal Scoring
CREATE TABLE IF NOT EXISTS public.deal_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    confidence_level NUMERIC(5,2),
    scoring_factors JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_score_range CHECK (score BETWEEN 0 AND 100),
    CONSTRAINT check_confidence_range CHECK (confidence_level BETWEEN 0 AND 100)
);

CREATE INDEX idx_deal_scores_deal_id ON public.deal_scores(deal_id);
CREATE INDEX idx_deal_scores_score ON public.deal_scores(score);
CREATE INDEX idx_deal_scores_created_at ON public.deal_scores(created_at);

-- Add new columns to existing tables
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS stage_duration JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS engagement_level TEXT,
ADD COLUMN IF NOT EXISTS next_steps TEXT,
ADD COLUMN IF NOT EXISTS risk_factors TEXT[],
ADD COLUMN IF NOT EXISTS success_factors TEXT[];

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS engagement_score INTEGER,
ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT,
ADD COLUMN IF NOT EXISTS response_time_average INTERVAL,
ADD COLUMN IF NOT EXISTS total_interactions INTEGER DEFAULT 0;

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_deal_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.deals
    SET last_interaction_date = NEW.created_at
    WHERE id = NEW.deal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contact_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.contacts
    SET last_interaction_date = NEW.created_at,
        total_interactions = COALESCE(total_interactions, 0) + 1
    WHERE id = NEW.contact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trg_deal_last_interaction
AFTER INSERT ON public.interactions
FOR EACH ROW
WHEN (NEW.deal_id IS NOT NULL)
EXECUTE FUNCTION update_deal_last_interaction();

CREATE TRIGGER trg_contact_last_interaction
AFTER INSERT ON public.interactions
FOR EACH ROW
WHEN (NEW.contact_id IS NOT NULL)
EXECUTE FUNCTION update_contact_last_interaction();

-- Add indexes for new columns
CREATE INDEX idx_deals_last_interaction_date ON public.deals(last_interaction_date);
CREATE INDEX idx_deals_engagement_level ON public.deals(engagement_level);
CREATE INDEX idx_contacts_engagement_score ON public.contacts(engagement_score);
CREATE INDEX idx_contacts_last_interaction_date ON public.contacts(last_interaction_date);

-- Comments for documentation
COMMENT ON TABLE public.deal_stages_history IS 'Tracks the history of deal stage changes';
COMMENT ON TABLE public.interactions IS 'Records all interactions with contacts and deals';
COMMENT ON TABLE public.communication_logs IS 'Detailed log of all communications';
COMMENT ON TABLE public.deal_outcomes IS 'Tracks the outcomes of closed deals';
COMMENT ON TABLE public.contact_engagement IS 'Measures and tracks contact engagement levels';
COMMENT ON TABLE public.deal_scores IS 'Stores deal scoring history and factors';