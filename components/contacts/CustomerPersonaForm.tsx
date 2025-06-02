import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerPersonaInput } from '@/lib/services/persona.service';

export function CustomerPersonaForm({ onSubmit }: { onSubmit: (data: CustomerPersonaInput) => void }) {
  const [formData, setFormData] = useState<CustomerPersonaInput>({
    name: '',
    jobTitle: '',
    company: '',
    preferredContactTime: 'morning' as const,
    preferredChannels: [],
    responseTimeExpectation: 'immediate' as const,
    industry: '',
    companySize: '',
    businessChallenges: [],
    painPoints: [],
    goals: [],
    currentSolution: '',
    evaluationCriteria: [],
    decisionTimeline: '',
    budgetRange: '',
    decisionMakers: [],
    notes: '',
    contactId: '',
    interactionHistory: {
      pastMeetings: [],
      emailThreads: [],
      callNotes: [],
      keyInsights: []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        {/* Communication Preferences */}
        <div>
          <Label htmlFor="preferredContactTime">Preferred Contact Time</Label>
          <Select
            value={formData.preferredContactTime}
            onValueChange={(value: 'morning' | 'afternoon' | 'evening') => setFormData({ ...formData, preferredContactTime: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select preferred contact time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferredChannels">Preferred Channels</Label>
          <Input
            id="preferredChannels"
            value={formData.preferredChannels.join(', ')}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                preferredChannels: e.target.value.split(',').map(s => s.trim())
              })
            }
            placeholder="Email, Phone, LinkedIn"
          />
        </div>

        <div>
          <Label htmlFor="responseTimeExpectation">Response Time Expectation</Label>
          <Select
            value={formData.responseTimeExpectation}
            onValueChange={(value: 'immediate' | '1-2hours' | '2-4hours' | 'nextDay') => setFormData({ ...formData, responseTimeExpectation: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select response time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="1-2hours">1-2 hours</SelectItem>
              <SelectItem value="2-4hours">2-4 hours</SelectItem>
              <SelectItem value="nextDay">Next day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Business Context */}
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Input
            id="companySize"
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          />
        </div>

        {/* Deal Context */}
        <div>
          <Label htmlFor="currentSolution">Current Solution</Label>
          <Textarea
            id="currentSolution"
            value={formData.currentSolution}
            onChange={(e) => setFormData({ ...formData, currentSolution: e.target.value })}
            placeholder="What solution are they currently using?"
          />
        </div>

        <div>
          <Label htmlFor="decisionTimeline">Decision Timeline</Label>
          <Input
            id="decisionTimeline"
            value={formData.decisionTimeline}
            onChange={(e) => setFormData({ ...formData, decisionTimeline: e.target.value })}
            placeholder="e.g., 1-2 months"
          />
        </div>

        {/* Additional Details */}
        <div className="col-span-2">
          <Label htmlFor="businessChallenges">Business Challenges</Label>
          <Input
            id="businessChallenges"
            value={formData.businessChallenges.join(', ')}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                businessChallenges: e.target.value.split(',').map(s => s.trim())
              })
            }
            placeholder="Enter challenges separated by commas"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="painPoints">Pain Points</Label>
          <Input
            id="painPoints"
            value={formData.painPoints.join(', ')}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                painPoints: e.target.value.split(',').map(s => s.trim())
              })
            }
            placeholder="Enter pain points separated by commas"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="goals">Goals</Label>
          <Input
            id="goals"
            value={formData.goals.join(', ')}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                goals: e.target.value.split(',').map(s => s.trim())
              })
            }
            placeholder="Enter goals separated by commas"
          />
        </div>

        {/* Interaction History */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-medium">Interaction History</h3>
          
          <div>
            <Label htmlFor="pastMeetings">Past Meetings</Label>
            <Textarea
              id="pastMeetings"
              value={formData.interactionHistory.pastMeetings?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                interactionHistory: {
                  ...formData.interactionHistory,
                  pastMeetings: e.target.value.split('\n').filter(Boolean)
                }
              })}
              placeholder="Enter each meeting on a new line"
              className="h-24"
            />
          </div>

          <div>
            <Label htmlFor="emailThreads">Email Threads</Label>
            <Textarea
              id="emailThreads"
              value={formData.interactionHistory.emailThreads?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                interactionHistory: {
                  ...formData.interactionHistory,
                  emailThreads: e.target.value.split('\n').filter(Boolean)
                }
              })}
              placeholder="Enter each email thread summary on a new line"
              className="h-24"
            />
          </div>

          <div>
            <Label htmlFor="callNotes">Call Notes</Label>
            <Textarea
              id="callNotes"
              value={formData.interactionHistory.callNotes?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                interactionHistory: {
                  ...formData.interactionHistory,
                  callNotes: e.target.value.split('\n').filter(Boolean)
                }
              })}
              placeholder="Enter each call note on a new line"
              className="h-24"
            />
          </div>

          <div>
            <Label htmlFor="keyInsights">Key Insights</Label>
            <Textarea
              id="keyInsights"
              value={formData.interactionHistory.keyInsights?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                interactionHistory: {
                  ...formData.interactionHistory,
                  keyInsights: e.target.value.split('\n').filter(Boolean)
                }
              })}
              placeholder="Enter each key insight on a new line"
              className="h-24"
            />
          </div>
        </div>

        <div className="col-span-2">
          <Button type="submit" className="w-full">
            Generate Persona
          </Button>
        </div>
      </div>
    </form>
  );
}
