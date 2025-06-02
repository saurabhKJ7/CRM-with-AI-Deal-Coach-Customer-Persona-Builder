// Common AI service for OpenAI API calls
export async function generateAIResponse(prompt: string, model: string = 'gpt-3.5-turbo', maxTokens: number = 1000) {
  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) {
    console.error('OpenAI API key is missing');
    throw new Error('OpenAI API key is not configured');
  }

  console.log('Making OpenAI API request...');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    console.log('OpenAI API Response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error response:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const completion = await response.json();
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
