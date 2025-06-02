import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { dealData, userMessage } = await request.json();
    
    if (!dealData) {
      return NextResponse.json({ error: 'Deal data is required' }, { status: 400 });
    }

    // Extract relevant deal information
    const dealTitle = dealData.title || dealData.name || 'Untitled Deal';
    const dealStage = dealData.stage || 'unknown';
    const dealAmount = dealData.amount ? `$${dealData.amount.toLocaleString()}` : 'unknown value';
    const dealProbability = dealData.probability ? `${dealData.probability}%` : 'unknown';
    
    // Contact information
    const contactInfo = dealData.contact ? 
      `${dealData.contact.first_name} ${dealData.contact.last_name}` : 
      (dealData.contacts ? `${dealData.contacts.first_name} ${dealData.contacts.last_name}` : 'No contact');
    
    // Company information
    const companyInfo = dealData.company ? dealData.company.name : 
      (dealData.companies ? dealData.companies.name : 'No company');

    // Get OpenAI API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Create a prompt for the AI
    const systemMessage = "You are an expert sales coach helping sales representatives close deals effectively.";
    const userPrompt = `
You are an expert sales coach AI assistant for a CRM system. You're helping a sales representative with a deal.

Deal Information:
- Title: ${dealTitle}
- Stage: ${dealStage}
- Value: ${dealAmount}
- Probability: ${dealProbability}
- Contact: ${contactInfo}
- Company: ${companyInfo}

The sales representative is asking: "${userMessage}"

Provide specific, actionable coaching advice tailored to this deal's stage and characteristics. 
Include:
1. Strategic focus points for this stage
2. Recommended next actions
3. Potential objections to prepare for
4. Questions the sales rep should ask

Format your response with clear sections using markdown, including emoji icons for better readability.
`;

    // Prepare the request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating AI coaching:', error);
    return NextResponse.json({ 
      error: 'Failed to generate AI coaching response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
