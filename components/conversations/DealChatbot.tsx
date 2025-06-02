"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DealChatInterface } from '@/components/deals/DealChatInterface';
import { Briefcase } from 'lucide-react';
import type { DealWithRelations } from "@/lib/types"

interface DealCoachAIProps {
  deals: DealWithRelations[]
  onConversationComplete?: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  dealId?: string
  suggestions?: DealAiSuggestion
}

export default function DealChatbot({ deals, onConversationLogged }: DealChatbotProps) {
  // Initialize with the first deal if available
  const [selectedDealId, setSelectedDealId] = React.useState<string>(deals && deals.length > 0 ? deals[0].id : "")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [pastConversations, setPastConversations] = React.useState<DealConversation[]>([])
  const [inputMessage, setInputMessage] = React.useState<string>("")
  const [conversationNotes, setConversationNotes] = React.useState<string>("")
  const [isRecording, setIsRecording] = React.useState<boolean>(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState<boolean>(false)
  const [isLoadingHistory, setIsLoadingHistory] = React.useState<boolean>(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false)
  const [selectedConversation, setSelectedConversation] = React.useState<DealConversation | null>(null)
  const [conversationAiSuggestion, setConversationAiSuggestion] = React.useState<DealAiSuggestion | null>(null)
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<string>("conversation-log")
  const { toast } = useToast()

  // Speech recognition setup
  const [recognition, setRecognition] = React.useState<any | null>(null)

  // Fetch past conversations when deal changes
  React.useEffect(() => {
    if (selectedDealId) {
      fetchPastConversations(selectedDealId);
    }
  }, [selectedDealId]);

  // Initialize speech recognition
  React.useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      // Use any to bypass TypeScript errors since these APIs might not be in the type definitions
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript.trim()) {
            setInputMessage(prev => prev + ' ' + transcript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognition);
      }
    }
  }, []);

  const selectedDeal = deals.find(deal => deal.id === selectedDealId)

  // Function to fetch past conversations for a deal
  const fetchPastConversations = async (dealId: string) => {
    if (!dealId) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/deals/${dealId}/conversations`);
      
      if (response.ok) {
        const result = await response.json();
        setPastConversations(result.data || []);
      } else {
        const errorText = await response.text().catch(() => 'Failed to get error details');
        console.error("Error fetching conversations:", errorText);
        toast({
          title: 'Error',
          description: 'Failed to load conversation history',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch AI suggestions for a conversation
  const fetchAiSuggestions = async (conversationId: string) => {
    setIsLoadingAiSuggestion(true);
    try {
      // First try to get existing AI suggestions
      const response = await fetch(`/api/deals/conversations/${conversationId}/suggestions`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setConversationAiSuggestion(result.data);
          return;
        }
      }
      
      // If no suggestions exist, trigger analysis to create them
      const analyzeResponse = await fetch(`/api/deals/conversations/${conversationId}/analyze`, {
        method: "POST",
      });
      
      if (analyzeResponse.ok) {
        const analysisResult = await analyzeResponse.json();
        setConversationAiSuggestion(analysisResult.data);
      } else {
        console.error("Error analyzing conversation:", await analyzeResponse.text());
        toast({
          title: "Analysis Failed",
          description: "Could not generate AI analysis for this conversation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    } finally {
      setIsLoadingAiSuggestion(false);
    }
  };

  // Handle opening conversation details
  const handleViewConversationDetails = (conversation: DealConversation) => {
    setSelectedConversation(conversation);
    setConversationAiSuggestion(null); // Reset previous suggestions
    setIsDetailsDialogOpen(true);
    
    // Fetch AI suggestions for this conversation
    fetchAiSuggestions(conversation.id);
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Helper function to generate unique IDs for messages
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      dealId: selectedDealId
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setInputMessage("")
    
    // Start analyzing with AI
    setIsAnalyzing(true)
    
    try {
      // Prepare form data for file upload
      const formData = new FormData()
      formData.append('message', inputMessage)
      formData.append('dealId', selectedDealId)
      
      // Add files if any
      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })
      
      // Clear uploaded files
      setUploadedFiles([])
      
      // Send to API
      const response = await fetch('/api/deals/conversations', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to log conversation')
      }
      
      const result = await response.json()
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'ai',
        content: "I've analyzed your conversation and saved it. Would you like me to provide insights or suggestions?",
        timestamp: new Date(),
        suggestions: result.data?.ai_suggestion
      }
      
      setChatMessages(prev => [...prev, aiMessage])
      
      // Notify parent component
      if (onConversationLogged) {
        onConversationLogged()
      }
      
      // Refresh conversation history
      fetchPastConversations(selectedDealId)
      
    } catch (error) {
      console.error('Error logging conversation:', error)
      toast({
        title: "Error",
        description: "Failed to log conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span>Deal Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conversation-log" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversation-log">
              <FileText className="h-4 w-4 mr-2" />
              Conversation Log
            </TabsTrigger>
            <TabsTrigger value="ai-coach">
              <Bot className="h-4 w-4 mr-2" />
              AI Coach
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation-log" className="space-y-4 mt-4">
            {/* Deal Selection */}
            <div className="space-y-2">
              <label htmlFor="deal-select" className="text-sm font-medium">
                Select Deal
              </label>
              <Select
                value={selectedDealId}
                onValueChange={(value) => setSelectedDealId(value)}
              >
                <SelectTrigger id="deal-select">
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name || deal.title || "Unnamed Deal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Past Conversations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Past Conversations</h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2 p-1">
                {isLoadingHistory ? (
                  <div className="text-center py-4 text-muted-foreground">Loading conversations...</div>
                ) : pastConversations.length > 0 ? (
                  pastConversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className="flex items-center justify-between p-2 rounded-md border hover:bg-accent cursor-pointer"
                      onClick={() => handleViewConversationDetails(conversation)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{new Date(conversation.created_at).toLocaleDateString()}</span>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {conversation.summary || "No summary available"}
                        </span>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No conversations yet</div>
                )}
              </div>
            </div>

            {/* Conversation Input */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Log New Conversation</h3>
              <Textarea 
                placeholder="Enter conversation notes..." 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px]"
              />
              
              {/* File Upload */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-1"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleRecording}
                    className={cn("gap-1", isRecording && "bg-red-100 text-red-600 border-red-200")}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="h-4 w-4" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span>Record</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Display uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((file, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isAnalyzing} 
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Log Conversation</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Current Session</h3>
                <div className="border rounded-md p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex flex-col p-3 rounded-lg",
                        message.type === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto max-w-[80%]" 
                          : "bg-muted mr-auto max-w-[80%]"
                      )}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {message.type === 'ai' && message.suggestions && (
                        <div className="mt-2 pt-2 border-t border-primary/20">
                          <div className="flex items-center gap-1 text-xs font-medium mb-1">
                            <Lightbulb className="h-3 w-3" />
                            <span>Key Insights</span>
                          </div>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            {message.suggestions.key_points?.split('\n').filter(Boolean).map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai-coach" className="space-y-4 mt-4">
            {/* Deal Selection for AI Coach */}
            <div className="space-y-2">
              <label htmlFor="ai-coach-deal-select" className="text-sm font-medium">
                Select Deal
              </label>
              <Select
                value={selectedDealId}
                onValueChange={(value) => setSelectedDealId(value)}
              >
                <SelectTrigger id="ai-coach-deal-select">
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name || deal.title || "Unnamed Deal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* AI Coach Interface */}
            {selectedDealId && selectedDeal && (
              <DealChatInterface 
                deal={selectedDeal} 
                userId="00000000-0000-0000-0000-000000000000" // Using a dummy UUID for now
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Conversation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            <DialogDescription>
              {selectedConversation && (
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedConversation.created_at).toLocaleString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-4">
              {/* Conversation Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Conversation</h3>
                <div className="p-4 border rounded-md whitespace-pre-wrap">
                  {selectedConversation.content}
                </div>
              </div>
              
              {/* Summary */}
              {selectedConversation.summary && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Summary</h3>
                  <div className="p-4 border rounded-md whitespace-pre-wrap">
                    {selectedConversation.summary}
                  </div>
                </div>
              )}
              
              {/* Next Steps */}
              {selectedConversation.next_steps && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Next Steps</h3>
                  <div className="p-4 border rounded-md whitespace-pre-wrap">
                    {selectedConversation.next_steps}
                  </div>
                </div>
              )}
              
              {/* AI Suggestions */}
              {isLoadingAiSuggestion ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Analyzing conversation...</p>
                </div>
              ) : conversationAiSuggestion ? (
                <div className="space-y-4">
                  <Separator />
                  
                  {/* Key Points */}
                  {conversationAiSuggestion.key_points && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span>Key Points</span>
                      </h3>
                      <div className="p-4 border rounded-md whitespace-pre-wrap">
                        {conversationAiSuggestion.key_points}
                      </div>
                    </div>
                  )}
                  
                  {/* Sentiment Analysis */}
                  {conversationAiSuggestion.sentiment_analysis && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Sentiment Analysis</span>
                      </h3>
                      <div className="p-4 border rounded-md whitespace-pre-wrap">
                        {conversationAiSuggestion.sentiment_analysis}
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {conversationAiSuggestion.recommendations && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span>Recommendations</span>
                      </h3>
                      <div className="p-4 border rounded-md whitespace-pre-wrap">
                        {conversationAiSuggestion.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => selectedConversation && fetchAiSuggestions(selectedConversation.id)}
                  className="w-full"
                >
                  Generate AI Analysis
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}