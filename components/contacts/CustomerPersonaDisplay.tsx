import { Card } from "@/components/ui/card";
import { GeneratedPersona } from "@/lib/services/persona.service";

interface DatabasePersona {
  id: string;
  contact_id: string;
  generated_persona: GeneratedPersona;
  created_at: string;
}

// Extended persona interface to match our UI needs
interface ExtendedPersona extends GeneratedPersona {
  communicationPreferences: {
    preferredChannels: string[];
    preferredContactTime: string;
    communicationStyle: string;
    responseTimeExpectation: string;
  };
  relationships: {
    primary: string[];
    secondary: string[];
    relationshipWithOurCompany?: string;
    keyContacts?: string[];
    relationshipDuration?: string;
  };
  decisionMaking: {
    process: string;
    stakeholders: string[];
    criteria: string[];
    timeline?: string;
  };
}

interface CustomerPersonaDisplayProps {
  persona: GeneratedPersona | DatabasePersona;
};

// Helper function to determine if the persona is a DatabasePersona
function isDatabasePersona(persona: any): persona is DatabasePersona {
  return 'generated_persona' in persona;
}

export function CustomerPersonaDisplay({ persona }: CustomerPersonaDisplayProps) {
  // Normalize the persona data whether it's from database or direct
  function isDatabasePersona(persona: any): persona is DatabasePersona {
    return 'generated_persona' in persona;
  }
  
  // Get the base persona data
  const basePersonaData: GeneratedPersona = isDatabasePersona(persona) ? persona.generated_persona : persona as GeneratedPersona;
  
  // Create an extended persona with additional fields for our UI
  const personaData: ExtendedPersona = {
    ...basePersonaData,
    // Ensure communicationPreferences is always defined
    communicationPreferences: {
      preferredChannels: basePersonaData.profile.preferredChannels || [],
      preferredContactTime: basePersonaData.profile.preferredContactTime || 'business hours',
      communicationStyle: basePersonaData.profile.communicationStyle || 'professional',
      responseTimeExpectation: 'prompt'
    },
    relationships: {
      ...basePersonaData.relationships,
      relationshipWithOurCompany: 'Client relationship',
      keyContacts: basePersonaData.relationships.primary || [],
      relationshipDuration: '1+ year'
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{personaData.profile.name}</h2>
      </div>

      {/* AI Generated Insights */}
      <Card className="p-5 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path></svg>
          </div>
          <h3 className="font-medium">AI Generated Insights</h3>
        </div>
        
        <div className="space-y-4 p-4 bg-indigo-50/50 rounded-lg">
          {/* If there's a complete aiGeneratedInsights field, display it */}
          {personaData.aiGeneratedInsights && (
            <div className="whitespace-pre-wrap text-sm">
              {personaData.aiGeneratedInsights}
            </div>
          )}
          
          {/* Otherwise, show the structured insights */}
          {!personaData.aiGeneratedInsights && (
            <>
              <div className="flex gap-2 items-start">
                <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                </div>
                <p className="text-sm">Focus on {personaData.profile.name}'s challenges around {personaData.businessContext.challenges?.[0] || 'their current business needs'}.</p>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <p className="text-sm">Communicate through their preferred channels: {personaData.communicationPreferences.preferredChannels[0] || 'email'} during {personaData.communicationPreferences.preferredContactTime || 'business hours'}.</p>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M15 9h.01"></path><path d="M11 9h.01"></path><path d="M16 14a4 4 0 0 1-8 0"></path></svg>
                </div>
                <p className="text-sm">Adapt your communication style to match their {personaData.communicationPreferences.communicationStyle || 'professional'} preference with {personaData.communicationPreferences.responseTimeExpectation || 'prompt'} responses.</p>
              </div>
            </>
          )}
          
          {/* Additional insights based on business context */}
          <div className="mt-4 pt-4 border-t border-indigo-100">
            <h4 className="font-medium text-indigo-700 mb-3">Business Challenges & Goals</h4>
            
            {/* Challenges */}
            {personaData.businessContext.challenges && personaData.businessContext.challenges.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-indigo-600 mb-2">Key Challenges:</p>
                <ul className="space-y-2">
                  {personaData.businessContext.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="bg-red-100 p-1 rounded-full mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                      </div>
                      <p className="text-sm">{challenge}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Goals */}
            {personaData.businessContext.goals && personaData.businessContext.goals.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-indigo-600 mb-2">Goals:</p>
                <ul className="space-y-2">
                  {personaData.businessContext.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                      </div>
                      <p className="text-sm">{goal}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Decision making insights removed as requested */}
        </div>
      </Card>
    </div>
  );
}
