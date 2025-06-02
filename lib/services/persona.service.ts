import { openAIService } from '@/lib/openai-service';
import { createClient } from '@supabase/supabase-js';
import type { Deal } from '@/lib/types';

export interface CustomerPersonaInput {
  name: string;
  jobTitle: string;
  company: string;
  preferredContactTime: 'morning' | 'afternoon' | 'evening';
  preferredChannels: string[];
  responseTimeExpectation: 'immediate' | '1-2hours' | '2-4hours' | 'nextDay';
  industry: string;
  companySize: string;
  businessChallenges: string[];
  painPoints: string[];
  goals: string[];
  currentSolution: string;
  evaluationCriteria: string[];
  decisionTimeline: string;
  budgetRange: string;
  decisionMakers: string[];
  notes: string;
  contactId: string;
  interactionHistory: {
    pastMeetings?: string[];
    emailThreads?: string[];
    callNotes?: string[];
    keyInsights?: string[];
  };
}

export interface GeneratedPersona {
  contact_id: string;
  profile: {
    name: string;
    jobTitle: string;
    company: string;
    industry: string;
    companySize: string;
    communicationStyle: string;
    preferredChannels: string[];
    preferredContactTime: string;
  };
  businessContext: {
    challenges: string[];
    painPoints: string[];
    goals: string[];
    timeline: string;
    budget: string;
  };
  decisionMaking: {
    process: string;
    stakeholders: string[];
    criteria: string[];
  };
  relationships: {
    primary: string[];
    secondary: string[];
  };
  aiGeneratedInsights: string;
  created_at: string;
}

export async function generatePersona(inputs: CustomerPersonaInput): Promise<GeneratedPersona> {
  const { contactId, ...personaInput } = inputs;

  // Create a mock deal object with required fields
  const mockDeal: Deal = {
    id: contactId,
    name: personaInput.name,
    title: personaInput.name,
    description: 'Customer persona generation',
    amount: 0,
    stage: 'lead',
    probability: 100,
    expected_close_date: new Date().toISOString(),
    contact_id: contactId,
    company_id: '',
    assigned_to: null,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Construct the AI prompt with contact-related fields
  const prompt = `Generate a detailed customer persona based on the following information:

Contact Information:
Name: ${personaInput.name}
Job Title: ${personaInput.jobTitle}
Company: ${personaInput.company}
Industry: ${personaInput.industry}
Company Size: ${personaInput.companySize}

Communication Preferences:
Preferred Contact Time: ${personaInput.preferredContactTime}
Preferred Channels: ${JSON.stringify(personaInput.preferredChannels)}
Response Time Expectation: ${personaInput.responseTimeExpectation}

Business Context:
Current Solution: ${personaInput.currentSolution}
Decision Timeline: ${personaInput.decisionTimeline}
Budget Range: ${personaInput.budgetRange}

Challenges and Goals:
Business Challenges: ${JSON.stringify(personaInput.businessChallenges)}
Pain Points: ${JSON.stringify(personaInput.painPoints)}
Goals: ${JSON.stringify(personaInput.goals)}
Evaluation Criteria: ${JSON.stringify(personaInput.evaluationCriteria)}
Decision Makers: ${JSON.stringify(personaInput.decisionMakers)}

Notes: ${personaInput.notes}

Please provide a detailed persona that includes:
1. Profile information (name, job title, company, industry, etc.)
2. Communication preferences and style
3. Decision-making process and timeline
4. Business challenges and pain points
5. Goals and objectives
6. Common objections and how to address them
7. Next steps and action items

Format the response as a JSON object with the following structure:
${JSON.stringify({
  profile: {
    name: '',
    jobTitle: '',
    company: '',
    industry: '',
    companySize: '',
    communicationStyle: ''
  },
  decisionMaking: {
    process: '',
    timeline: '',
    keyStakeholders: [] as string[],
    evaluationCriteria: [] as string[]
  },
  motivators: {
    primary: [] as string[],
    secondary: [] as string[]
  },
  objections: {
    common: [] as string[],
    howToAddress: [] as string[]
  },
  communication: {
    preferredStyle: '',
    bestTime: '',
    channels: [] as string[],
    frequency: ''
  },
  nextSteps: {
    immediate: [] as string[],
    shortTerm: [] as string[],
    longTerm: [] as string[]
  }
}, null, 2)}`;

  try {
    const response = await openAIService.generateCoachingResponse(prompt, mockDeal);
    const generatedPersona = JSON.parse(response) as GeneratedPersona;

    // Save the persona to the database using Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: savedPersona, error } = await supabase
      .from('customer_personas')
      .insert({
        contact_id: contactId,
        inputs: JSON.stringify(inputs),
        generated_persona: JSON.stringify(generatedPersona),
        created_by: process.env.NEXT_PUBLIC_SUPABASE_PROFILE_ID
      })
      .select()
      .single();

    if (error) throw new Error('Failed to save persona to database');
    return savedPersona;

    return savedPersona;
  } catch (error) {
    console.error('Error generating persona:', error);
    throw new Error('Failed to generate customer persona');
  }
}
