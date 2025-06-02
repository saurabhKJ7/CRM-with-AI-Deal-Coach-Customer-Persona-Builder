"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Plus, Phone, Mail, Users, MessageSquare, Calendar, AlertCircle } from "lucide-react"
import type { Deal, DealConversation, DealAiSuggestion } from "@/lib/types"
import ConversationForm from "./ConversationForm"
import AISuggestions from "./AISuggestions"

interface ConversationsListProps {
  deal: Deal
}

export default function ConversationsList({ deal }: ConversationsListProps) {
  const [conversations, setConversations] = React.useState<DealConversation[]>([])
  const [selectedConversation, setSelectedConversation] = React.useState<DealConversation | null>(null)
  const [aiSuggestions, setAiSuggestions] = React.useState<DealAiSuggestion | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const { toast } = useToast()

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/deals/${deal.id}/conversations`)
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setConversations(data.data || [])
      
      // If there's a selected conversation, update it with fresh data
      if (selectedConversation) {
        const updatedConversation = data.data.find(
          (c: DealConversation) => c.id === selectedConversation.id
        )
        if (updatedConversation) {
          setSelectedConversation(updatedConversation)
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAiSuggestions = async (conversationId: string) => {
    try {
      setIsAnalyzing(true)
      const response = await fetch(`/api/deals/conversations/${conversationId}/analyze`, {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setAiSuggestions(data.data)
    } catch (error) {
      console.error("Error fetching AI suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to analyze conversation",
        variant: "destructive",
      })
      setAiSuggestions(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  React.useEffect(() => {
    fetchConversations()
  }, [deal.id])

  const handleSelectConversation = (conversation: DealConversation) => {
    setSelectedConversation(conversation)
    fetchAiSuggestions(conversation.id)
  }

  const handleAddConversation = () => {
    setIsAddDialogOpen(true)
  }

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    fetchConversations()
  }

  const handleRefreshAnalysis = () => {
    if (selectedConversation) {
      fetchAiSuggestions(selectedConversation.id)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'meeting':
        return <Users className="h-4 w-4" />
      case 'chat':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return "bg-gray-100 text-gray-800"
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return "bg-green-100 text-green-800"
      case 'negative':
        return "bg-red-100 text-red-800"
      case 'mixed':
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Conversations</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddConversation} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Log Conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <ConversationForm 
              deal={deal} 
              onSuccess={handleAddSuccess} 
              onCancel={() => setIsAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Conversations</TabsTrigger>
          {selectedConversation && (
            <TabsTrigger value="details">Conversation Details</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="list">
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start tracking your conversations with this contact to get AI-powered insights.
                  </p>
                  <Button onClick={handleAddConversation}>
                    <Plus className="h-4 w-4 mr-1" /> Log Your First Conversation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2 flex items-center gap-1">
                          {getIconForType(conversation.type)}
                          {conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(new Date(conversation.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      {conversation.sentiment && (
                        <Badge variant="secondary" className={getSentimentColor(conversation.sentiment)}>
                          {conversation.sentiment}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{conversation.summary}</h4>
                    {conversation.participants.length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Participants:</span> {conversation.participants.join(', ')}
                      </div>
                    )}
                    {conversation.next_steps && conversation.next_steps.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Next Steps:</div>
                        <ul className="text-sm list-disc list-inside">
                          {conversation.next_steps.slice(0, 2).map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                          {conversation.next_steps.length > 2 && (
                            <li className="text-gray-500">+{conversation.next_steps.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          {selectedConversation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Badge variant="outline" className="mr-2 flex items-center gap-1">
                      {getIconForType(selectedConversation.type)}
                      {selectedConversation.type.charAt(0).toUpperCase() + selectedConversation.type.slice(1)}
                    </Badge>
                    {format(new Date(selectedConversation.date), "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{selectedConversation.summary}</h3>
                    {selectedConversation.sentiment && (
                      <Badge variant="secondary" className={getSentimentColor(selectedConversation.sentiment)}>
                        {selectedConversation.sentiment}
                      </Badge>
                    )}
                  </div>
                  
                  {selectedConversation.participants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Participants</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedConversation.participants.map((participant, index) => (
                          <Badge key={index} variant="outline">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedConversation.detailed_notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Detailed Notes</h4>
                      <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                        {selectedConversation.detailed_notes}
                      </div>
                    </div>
                  )}
                  
                  {selectedConversation.next_steps && selectedConversation.next_steps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Next Steps</h4>
                      <ul className="space-y-2">
                        {selectedConversation.next_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <AISuggestions 
                suggestions={aiSuggestions} 
                isLoading={isAnalyzing}
                onRefresh={handleRefreshAnalysis}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}