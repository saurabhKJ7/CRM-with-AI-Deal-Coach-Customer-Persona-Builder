import { Card } from '@/components/ui/card';
import { GeneratedPersona } from '@/lib/services/persona.service';

interface DatabasePersona {
  id: string;
  contact_id: string;
  inputs: any;
  generated_persona: GeneratedPersona;
  created_at: string;
  updated_at: string;
}

export function CustomerPersonaDisplay({ persona }: { persona: DatabasePersona }) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Customer Persona</h3>

      {/* Profile */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Profile</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{persona.generated_persona.profile.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Job Title</p>
            <p className="text-sm">{persona.generated_persona.profile.jobTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Company</p>
            <p className="text-sm">{persona.generated_persona.profile.company}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <p className="text-sm">{persona.generated_persona.profile.industry}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Company Size</p>
            <p className="text-sm">{persona.generated_persona.profile.companySize}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Communication Style</p>
            <p className="text-sm">{persona.generated_persona.profile.communicationStyle}</p>
          </div>
        </div>
      </div>

      {/* Decision Making */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Decision Making</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Process</p>
            <p className="text-sm">{persona.generated_persona.decisionMaking.process}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Timeline</p>
            <p className="text-sm">{persona.generated_persona.businessContext.timeline}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Key Stakeholders</p>
            <ul className="text-sm list-disc list-inside">
              {persona.generated_persona.decisionMaking.stakeholders?.map((stakeholder, index) => (
                <li key={index}>{stakeholder}</li>
              )) || <li>No stakeholders specified</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Evaluation Criteria</p>
            <ul className="text-sm list-disc list-inside">
              {persona.generated_persona.decisionMaking.criteria?.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              )) || <li>No criteria specified</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Relationships</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Primary</p>
            <ul className="list-disc list-inside text-sm">
              {persona.generated_persona.relationships.primary?.map((relation, index) => (
                <li key={index}>{relation}</li>
              )) || <li>No primary relationships specified</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Secondary</p>
            <ul className="list-disc list-inside text-sm">
              {persona.generated_persona.relationships.secondary?.map((relation, index) => (
                <li key={index}>{relation}</li>
              )) || <li>No secondary relationships specified</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Objections and Budget */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Objections and Budget</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Budget Range</p>
            <p className="text-sm">{persona.generated_persona.businessContext.budget || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Timeline</p>
            <p className="text-sm">{persona.generated_persona.businessContext.timeline || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Communication Preferences</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Communication Style</p>
            <p className="text-sm">{persona.generated_persona.profile.communicationStyle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Preferred Contact Time</p>
            <p className="text-sm">{persona.generated_persona.profile.preferredContactTime}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Preferred Channels</p>
            <ul className="list-disc list-inside text-sm">
              {persona.generated_persona.profile.preferredChannels?.map((channel, index) => (
                <li key={index}>{channel}</li>
              )) || <li>No preferred channels specified</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Generated Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">AI Generated Insights</h4>
        <p className="text-sm whitespace-pre-wrap">{persona.generated_persona.aiGeneratedInsights}</p>
      </div>

      {/* Business Context */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Business Context</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Business Challenges</p>
            <ul className="text-sm list-disc list-inside">
              {persona.generated_persona.businessContext.challenges?.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              )) || <li>No challenges specified</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pain Points</p>
            <ul className="text-sm list-disc list-inside">
              {persona.generated_persona.businessContext.painPoints?.map((painPoint, index) => (
                <li key={index}>{painPoint}</li>
              )) || <li>No pain points specified</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Goals</p>
            <ul className="text-sm list-disc list-inside">
              {persona.generated_persona.businessContext.goals?.map((goal, index) => (
                <li key={index}>{goal}</li>
              )) || <li>No goals specified</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Budget</p>
            <p className="text-sm">{persona.generated_persona.businessContext.budget}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
