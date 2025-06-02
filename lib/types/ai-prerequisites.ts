// AI Prerequisites Types

// Deal Stage History
export type DealStageHistory = {
  id: string;
  deal_id: string;
  from_stage: string;
  to_stage: string;
  change_reason: string | null;
  changed_by: string;
  created_at: string;
  metadata: Record<string, any>;
};

// Interaction Types
export type InteractionType = 'email' | 'call' | 'meeting' | 'note' | 'message' | 'other';
export type InteractionSource = 'manual' | 'email' | 'phone' | 'web' | 'api' | 'system';

export type Interaction = {
  id: string;
  type: InteractionType;
  source: InteractionSource;
  contact_id: string | null;
  deal_id: string | null;
  content: string | null;
  metadata: Record<string, any>;
  sentiment: string | null;
  created_by: string;
  created_at: string;
};

// Communication Types
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationChannel = 'email' | 'phone' | 'meeting' | 'chat' | 'social' | 'other';
export type CommunicationStatus = 'draft' | 'sent' | 'delivered' | 'failed' | 'received' | 'read';

export type CommunicationLog = {
  id: string;
  interaction_id: string;
  direction: CommunicationDirection;
  channel: CommunicationChannel;
  status: CommunicationStatus;
  subject: string | null;
  content: string | null;
  recipients: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
};

// Deal Outcome Types
export type DealOutcomeType = 'won' | 'lost' | 'abandoned' | 'no_decision';

export type DealOutcome = {
  id: string;
  deal_id: string;
  outcome: DealOutcomeType;
  primary_reason: string | null;
  detailed_reasons: Record<string, any>;
  competitor_id: string | null;
  competitor_name: string | null;
  lost_to_competitor: boolean;
  winning_factors: string[];
  losing_factors: string[];
  learning_points: string[];
  feedback: string | null;
  decision_maker_id: string | null;
  closed_amount: number | null;
  closed_at: string | null;
  created_by: string;
  created_at: string;
};

// Contact Engagement Types
export type EngagementType = 'cold' | 'warm' | 'hot' | 'inactive';

export type ContactEngagement = {
  id: string;
  contact_id: string;
  engagement_type: EngagementType;
  engagement_score: number | null;
  last_interaction_date: string | null;
  interaction_count: number;
  response_rate: number | null;
  average_response_time: string | null; // ISO duration
  preferred_channel: string | null;
  active_deals_count: number;
  metadata: Record<string, any>;
  updated_at: string;
};

// Deal Scoring Types
export type DealScore = {
  id: string;
  deal_id: string;
  score: number;
  confidence_level: number;
  scoring_factors: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
};

// Extended Types for Existing Entities
export type DealExtended = {
  stage_duration: Record<string, any>;
  last_interaction_date: string | null;
  engagement_level: string | null;
  next_steps: string | null;
  risk_factors: string[];
  success_factors: string[];
};

export type ContactExtended = {
  engagement_score: number | null;
  last_interaction_date: string | null;
  preferred_contact_method: string | null;
  response_time_average: string | null; // ISO duration
  total_interactions: number;
};

// Utility Types
export type TimelineEvent = {
  id: string;
  entity_type: 'deal' | 'contact' | 'interaction' | 'communication';
  entity_id: string;
  event_type: string;
  event_data: Record<string, any>;
  occurred_at: string;
};

export type EngagementMetrics = {
  score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: Record<string, number>;
  last_updated: string;
};