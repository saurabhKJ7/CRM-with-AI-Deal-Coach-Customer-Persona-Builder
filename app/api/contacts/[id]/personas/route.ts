import { supabaseAdmin } from '@/lib/supabase/admin-client'
import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/services/ai.service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('customer_personas')
      .select('*')
      .eq('contact_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    )
  }
}

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log('POST /api/contacts/[id]/personas started');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Contact ID:', params.id);
  
  // Log request headers
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log('Request headers:', headers);
  try {
    // Clone the request for multiple reads if needed
    const clonedRequest = request.clone();
    
    console.log('Starting persona generation...');
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      // Try to get the raw body text
      const rawBody = await clonedRequest.text();
      console.log('Raw request body:', rawBody);
      throw new Error('Failed to parse request body as JSON');
    }
    console.log('Request body:', body);
    
    // The request body is now the inputs directly
    const inputs = body;
    if (!inputs || typeof inputs !== 'object') {
      throw new Error('Invalid request body format');
    }
    console.log('Received inputs:', inputs);
    
    // Validate required inputs
    const requiredFields = ['name', 'jobTitle', 'company', 'industry', 'companySize'];
    for (const field of requiredFields) {
      if (!inputs[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Generate AI persona using OpenAI API directly
    const prompt = `Generate a detailed customer persona for the following contact, incorporating their interaction history:

Basic Information:
- Name: ${inputs.name}
- Job Title: ${inputs.jobTitle}
- Company: ${inputs.company}
- Industry: ${inputs.industry}
- Company Size: ${inputs.companySize}

Business Context:
${inputs.businessChallenges?.length ? `Business Challenges:
${inputs.businessChallenges.join('\n')}` : ''}
${inputs.painPoints?.length ? `\n\nPain Points:
${inputs.painPoints.join('\n')}` : ''}
${inputs.goals?.length ? `\n\nGoals:
${inputs.goals.join('\n')}` : ''}

Interaction History:
${inputs.interactionHistory?.pastMeetings?.length ? `Past Meetings:
${inputs.interactionHistory.pastMeetings.join('\n')}` : ''}
${inputs.interactionHistory?.emailThreads?.length ? `\n\nEmail Threads:
${inputs.interactionHistory.emailThreads.join('\n')}` : ''}
${inputs.interactionHistory?.callNotes?.length ? `\n\nCall Notes:
${inputs.interactionHistory.callNotes.join('\n')}` : ''}
${inputs.interactionHistory?.keyInsights?.length ? `\n\nKey Insights:
${inputs.interactionHistory.keyInsights.join('\n')}` : ''}

Please analyze all the information, including the interaction history, and provide a comprehensive persona that includes:

1. Professional Profile
   - Background and experience based on interactions
   - Role responsibilities and observed behaviors
   - Industry expertise demonstrated in conversations

2. Decision Making Style
   - Observed decision process from past interactions
   - Key influencing factors seen in meetings
   - Risk tolerance based on discussions

3. Business Context
   - Current challenges and pain points
   - Goals and objectives
   - Timeline and budget considerations

4. Communication Style
   - Preferred channels from actual interactions
   - Observed communication patterns
   - Best contact times based on history

5. Relationship Dynamics
   - Key stakeholders involved
   - Internal relationships
   - External relationships

Format the response in a clear, organized manner using the above sections, ensuring insights are drawn from both provided information and interaction history.`;

    console.log('Generating AI persona with prompt:', prompt);
    const aiResponse = await generateAIResponse(prompt);

    // Create persona object with safe defaults
    const generatedPersona = {
      contact_id: params.id,
      profile: {
        name: inputs.name,
        jobTitle: inputs.jobTitle,
        company: inputs.company,
        industry: inputs.industry,
        companySize: inputs.companySize,
        communicationStyle: inputs.communicationStyle || 'Not specified',
        preferredChannels: Array.isArray(inputs.preferredChannels) ? inputs.preferredChannels : [],
        preferredContactTime: inputs.preferredContactTime || 'Not specified',
      },
      businessContext: {
        challenges: Array.isArray(inputs.businessChallenges) ? inputs.businessChallenges : [],
        painPoints: Array.isArray(inputs.painPoints) ? inputs.painPoints : [],
        goals: Array.isArray(inputs.goals) ? inputs.goals : [],
        timeline: inputs.timeline || 'Not specified',
        budget: inputs.budget || 'Not specified',
      },
      decisionMaking: {
        stakeholders: Array.isArray(inputs.stakeholders) ? inputs.stakeholders : [],
        process: inputs.decisionProcess || 'Not specified',
        criteria: Array.isArray(inputs.criteria) ? inputs.criteria : [],
      },
      relationships: {
        primary: [],
        secondary: []
      },
      aiGeneratedInsights: aiResponse || 'No insights generated',
      created_at: new Date().toISOString()
    }

    // Structure data according to database schema
    const personaData = {
      contact_id: params.id,
      inputs: inputs, // Store original form inputs
      generated_persona: generatedPersona, // Store generated persona
      created_at: new Date().toISOString()
    };

    console.log('Inserting persona data:', personaData);
    const { data: persona, error } = await supabaseAdmin
      .from('customer_personas')
      .insert(personaData)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error in POST /api/contacts/[id]/personas:', error);
    console.error('Error stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    // Create detailed error response
    const errorResponse = {
      error: error instanceof Error ? error.message : 'Failed to generate persona',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      path: request.url,
      method: request.method
    };
    console.error('Error response:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
