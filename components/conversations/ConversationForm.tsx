"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, PlusIcon, MinusIcon, Mic, Paperclip, SendIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Deal, DealConversation } from "@/lib/types"

interface ConversationFormProps {
  deal?: Deal
  dealId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ConversationForm({ deal, dealId, onSuccess, onCancel }: ConversationFormProps) {
  const [dealData, setDealData] = React.useState<Deal | null>(deal || null)
  
  // Fetch deal data if only dealId is provided
  React.useEffect(() => {
    if (dealId && !deal) {
      const fetchDeal = async () => {
        try {
          const response = await fetch(`/api/deals/${dealId}`);
          if (response.ok) {
            const data = await response.json();
            setDealData(data.data);
          }
        } catch (error) {
          console.error("Error fetching deal:", error);
        }
      };
      
      fetchDeal();
    }
  }, [dealId, deal]);
  const [type, setType] = React.useState<string>("call")
  const [date, setDate] = React.useState<Date>(new Date())
  const [summary, setSummary] = React.useState<string>("")
  const [detailedNotes, setDetailedNotes] = React.useState<string>("")
  const [participants, setParticipants] = React.useState<string[]>([])
  const [nextSteps, setNextSteps] = React.useState<string[]>([])
  const [newParticipant, setNewParticipant] = React.useState<string>("")
  const [newNextStep, setNewNextStep] = React.useState<string>("")
  const [isRecording, setIsRecording] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const { toast } = useToast()

  // Speech recognition setup
  const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setDetailedNotes(prev => prev + ' ' + transcript)
      }
      
      recognitionInstance.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        toast({
          title: "Recording Error",
          description: `Failed to record: ${event.error}`,
          variant: "destructive",
        })
      }
      
      setRecognition(recognitionInstance)
    }
  }, [toast])

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      })
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  const addParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants([...participants, newParticipant.trim()])
      setNewParticipant("")
    }
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const addNextStep = () => {
    if (newNextStep.trim()) {
      setNextSteps([...nextSteps, newNextStep.trim()])
      setNewNextStep("")
    }
  }

  const removeNextStep = (index: number) => {
    setNextSteps(nextSteps.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!dealData) {
      toast({
        title: "Error",
        description: "Deal information is missing",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!summary.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a summary of the conversation.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(true)
    
    try {
      const conversationData: Partial<DealConversation> = {
        type: type as any,
        date: date.toISOString(),
        summary: summary.trim(),
        detailed_notes: detailedNotes.trim() || null,
        participants: participants.length ? participants : [],
        next_steps: nextSteps.length ? nextSteps : null,
        deal_id: dealData.id, // Ensure deal_id is included
        sentiment: 'neutral' // Set a default sentiment
      }
      
      const response = await fetch(`/api/deals/${dealData.id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversationData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Conversation save error:', result);
        toast({
          title: "Error",
          description: result.error || result.details || "Failed to save conversation",
          variant: "destructive"
        });
        throw new Error(result.error || result.details || "Failed to save conversation")
      }
      
      // Now analyze the conversation
      const analyzeResponse = await fetch(`/api/deals/conversations/${result.data.id}/analyze`, {
        method: "POST",
      })
      
      if (!analyzeResponse.ok) {
        console.warn("AI analysis failed, but conversation was saved")
      }
      
      toast({
        title: "Success",
        description: "Conversation logged successfully",
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error saving conversation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save conversation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Conversation for {dealData?.title || 'Loading...'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conversation Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Input
              placeholder="Brief overview of the conversation"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Detailed Notes</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={cn(isRecording && "bg-red-100 text-red-600 border-red-200")}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? "Stop Recording" : "Record"}
              </Button>
            </div>
            <Textarea
              placeholder="Complete conversation notes"
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Participants</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add participant"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
              />
              <Button type="button" variant="outline" onClick={addParticipant}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {participant}
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <MinusIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Next Steps</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add next step"
                value={newNextStep}
                onChange={(e) => setNewNextStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNextStep())}
              />
              <Button type="button" variant="outline" onClick={addNextStep}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-gray-100 rounded-md px-3 py-2 flex-1">
                    {step}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNextStep(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? "Saving..." : "Save Conversation"}
          <SendIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}