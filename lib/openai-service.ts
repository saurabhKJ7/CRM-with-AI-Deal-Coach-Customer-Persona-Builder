import type { DealConversation, DealAiSuggestion, Deal } from './types';
import { ConversationService } from './services/conversation.service';

const conversationService = new ConversationService();

export const openAIService = {
  // Generate analysis for won or lost deals
  generateWinLossAnalysis: async (
    analysisType: 'win' | 'loss',
    deal: any,
    formData: any
  ): Promise<string> => {
    try {
      const API_KEY = process.env.OPENAI_API_KEY;
      if (!API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const systemPrompt = `You are an expert sales analyst.
      Analyze this ${analysisType === 'win' ? 'won' : 'lost'} deal and provide insights.
      
      Your analysis should include:
      1. Key factors that contributed to the ${analysisType}
      2. Patterns or insights that can be applied to future deals
      3. Specific recommendations for the sales team
      
      Keep your response professional and actionable.`;
      
      const userMessage = `
      Deal Information:
      - Name: ${deal.name}
      - Amount: ${deal.amount || 'Not specified'}
      - Stage: ${deal.stage}
      
      Additional Context:
      - Decision Maker Role: ${formData.decisionMakerRole || 'Not specified'}
      - Competing Solutions: ${formData.competingSolutions || 'None mentioned'}
      - Budget Constraints: ${formData.budgetConstraints ? 'Yes' : 'No'}
      - Budget Notes: ${formData.budgetNotes || 'None'}
      - Timeline Pressure: ${formData.timelinePressure || 'Not specified'}
      - Key Factors: ${formData.keyFactors?.join(', ') || 'None mentioned'}
      - Missing Features: ${formData.missingFeatures?.join(', ') || 'None mentioned'}
      
      Please provide a detailed analysis of why this deal was ${analysisType === 'win' ? 'won' : 'lost'}.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || 'No analysis generated.';
    } catch (error) {
      console.error('Error generating win/loss analysis:', error);
      throw error;
    }
  },
  // Generate response for handling customer objections
  generateObjectionResponse: async (objection: string): Promise<string> => {
    try {
      const API_KEY = process.env.OPENAI_API_KEY;
      if (!API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const systemPrompt = `You are an expert sales professional.
      Provide a concise and convincing response to handle this customer objection.
      Your response should:
      1. Acknowledge their concern empathetically
      2. Reframe the objection positively
      3. Provide specific value-based counter-points
      4. Suggest a clear next step
      
      Keep your response between 60-90 words and maintain a professional, confident tone.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: objection }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error('Error generating objection response:', error);
      throw error;
    }
  },
  // Generate coaching response for Deal Coach AI chat
  generateCoachingResponse: async (userMessage: string, deal: Deal): Promise<string> => {
    try {
      const API_KEY = process.env.OPENAI_API_KEY;
      if (!API_KEY) {
        console.error('OpenAI API key is missing');
        throw new Error('OpenAI API key is not configured');
      }

      // Create prompt for AI coach
      const systemPrompt = `
        You are an expert sales coach AI assistant.
        
        Deal Information:
        - Name: ${deal.name || deal.title || 'Unnamed Deal'}
        - Stage: ${deal.stage}
        - Amount: $${deal.amount || 'Not specified'}
        - Probability: ${deal.probability}%
        - Description: ${deal.description || 'Not provided'}
        
        Provide helpful, actionable advice to improve the close probability of this deal.
        Focus on practical next steps, objection handling, and value proposition enhancement.
        Be concise but thorough in your response.
      `;
      
      // Get AI completion using fetch API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || 'No coaching advice generated.';
    } catch (error) {
      console.error('Error generating coaching response:', error);
      return 'Sorry, I was unable to generate coaching advice at this time. Please try again later.';
    }
  },
  // Create embedding for a conversation
  createEmbedding: async (text: string): Promise<number[] | null> => {
    try {
      const API_KEY = process.env.OPENAI_API_KEY;
      if (!API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      return null;
    }
  },
  
  // Analyze a conversation and generate AI suggestions
  analyzeConversation: async (
    conversation: DealConversation, 
    deal: Deal
  ): Promise<DealAiSuggestion | null> => {
    try {
      const API_KEY = process.env.OPENAI_API_KEY;
      if (!API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      // Combine relevant text for analysis
      const textToAnalyze = `
        Deal Title: ${deal.title}
        Deal Stage: ${deal.stage}
        Deal Amount: ${deal.amount || 'Not specified'}
        
        Conversation Type: ${conversation.type}
        Conversation Summary: ${conversation.summary}
        Detailed Notes: ${conversation.detailed_notes || ''}
        
        Participants: ${conversation.participants.join(', ')}
      `;
      
      // Create prompt for AI coach
      const systemPrompt = `
        You are an expert sales coach AI assistant.
        Analyze the following conversation from a sales deal and provide actionable insights.
        Focus on identifying:
        1. Key points from the conversation
        2. Potential customer objections
        3. Sentiment analysis
        4. Recommended next steps
        5. Follow-up questions to ask
        
        Your response should be structured and concise, with specific recommendations based on the deal stage.
        Avoid generic advice and focus on what's relevant to this specific conversation.
      `;
      
      // Get AI completion using fetch API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: textToAnalyze }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const completion = await response.json();
      const aiResponse = completion.choices[0].message.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI');
      }
      
      // Extract insights from AI response
      const keyPoints = extractKeyPoints(aiResponse);
      const objections = extractObjections(aiResponse);
      const sentiment = extractSentiment(aiResponse);
      const nextSteps = extractNextSteps(aiResponse);
      const followUpQuestions = extractFollowUpQuestions(aiResponse);
      
      // Create suggestion object
      const suggestion: Partial<DealAiSuggestion> = {
        conversation_id: conversation.id,
        next_steps: nextSteps,
        key_points: keyPoints,
        objections_identified: objections,
        sentiment_analysis: sentiment,
        follow_up_questions: followUpQuestions,
      };
      
      // Save to database
      const savedSuggestion = await conversationService.createAiSuggestions(suggestion);
      
      return savedSuggestion;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return null;
    }
  }
};

// Helper functions to extract structured data from AI response
function extractKeyPoints(text: string): string[] {
  const keyPointsRegex = /key points?:?.*?(?:\n\n|\n(?=[a-z]+:)|\n$|$)/is;
  const match = text.match(keyPointsRegex);
  
  if (!match) return [];
  
  return match[0]
    .replace(/key points?:?/i, '')
    .split(/\n-|\n\d+\./)
    .map(point => point.trim())
    .filter(point => point.length > 0);
}

function extractObjections(text: string): string[] {
  const objectionsRegex = /objections?:?.*?(?:\n\n|\n(?=[a-z]+:)|\n$|$)/is;
  const match = text.match(objectionsRegex);
  
  if (!match) return [];
  
  return match[0]
    .replace(/objections?:?/i, '')
    .split(/\n-|\n\d+\./)
    .map(objection => objection.trim())
    .filter(objection => objection.length > 0);
}

function extractSentiment(text: string): string {
  const sentimentRegex = /sentiment:?.*?(?:\n|$)/i;
  const match = text.match(sentimentRegex);
  
  if (!match) return 'neutral';
  
  const sentiment = match[0].replace(/sentiment:?/i, '').trim().toLowerCase();
  
  if (sentiment.includes('positive')) return 'positive';
  if (sentiment.includes('negative')) return 'negative';
  if (sentiment.includes('mixed')) return 'mixed';
  
  return 'neutral';
}

function extractNextSteps(text: string): string[] {
  const nextStepsRegex = /next steps?:?.*?(?:\n\n|\n(?=[a-z]+:)|\n$|$)/is;
  const match = text.match(nextStepsRegex);
  
  if (!match) return [];
  
  return match[0]
    .replace(/next steps?:?/i, '')
    .split(/\n-|\n\d+\./)
    .map(step => step.trim())
    .filter(step => step.length > 0);
}

function extractFollowUpQuestions(text: string): string[] {
  const questionsRegex = /follow-?up questions?:?.*?(?:\n\n|\n(?=[a-z]+:)|\n$|$)/is;
  const match = text.match(questionsRegex);
  
  if (!match) return [];
  
  return match[0]
    .replace(/follow-?up questions?:?/i, '')
    .split(/\n-|\n\d+\.|\n\?/)
    .map(question => question.trim())
    .filter(question => question.length > 0)
    .map(question => question.endsWith('?') ? question : `${question}?`);
}