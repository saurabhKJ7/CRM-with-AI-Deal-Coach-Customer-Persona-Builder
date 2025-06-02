"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { openAIService } from '@/lib/openai-service'
import { Loader2, Copy, Check, MessageSquare, Lightbulb, Send, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ObjectionHandlerChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Check for "bye AI" (case insensitive)
    if (userMessage.toLowerCase() === 'bye ai') {
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Goodbye! Let me know if you need help with more objections.' }
      ])
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const prompt = `As an expert sales professional, provide a brief response (50-70 words) to handle this customer objection:

Customer Objection: "${userMessage}"

Structure your response to:
1. Acknowledge concern
2. Reframe positively
3. Counter with value
4. Suggest next step

Be concise and professional.`

      const response = await fetch('/api/objection-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objection: userMessage })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.response
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle copying text to clipboard
  const handleCopyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast({
      description: "Response copied to clipboard",
      duration: 2000,
    })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-md overflow-hidden">
        <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-blue-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">AI Objection Handler</h3>
                <p className="text-sm text-blue-700">Get expert responses to customer objections</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <MessageSquare className="h-3 w-3 mr-1" />
              {messages.filter(m => m.role === 'assistant').length} Responses
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-[400px] p-6">
            <div className="flex flex-col gap-6 w-full">
              {messages.length === 0 ? (
                <div className="flex h-[300px] bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100">
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Start a conversation</h3>
                      <p className="text-blue-700 mt-1">Type a customer objection below to get AI-powered responses.</p>
                      <p className="text-sm text-blue-600 mt-4">Type "bye AI" to end the conversation.</p>
                    </div>
                  </div>
                  
                  <div className="w-[250px] bg-blue-50 p-4 rounded-r-xl border-l border-blue-100 flex flex-col">
                    <h4 className="font-medium text-blue-800 mb-3">Example Objections:</h4>
                    <div className="grid grid-cols-1 gap-3 text-left">
                      <div className="bg-white p-2 rounded border border-blue-100 text-blue-700 text-sm hover:bg-blue-100 cursor-pointer transition-colors">
                        "Your product is too expensive compared to competitors."  
                      </div>
                      <div className="bg-white p-2 rounded border border-blue-100 text-blue-700 text-sm hover:bg-blue-100 cursor-pointer transition-colors">
                        "We're already using a different solution that works fine."  
                      </div>
                      <div className="bg-white p-2 rounded border border-blue-100 text-blue-700 text-sm hover:bg-blue-100 cursor-pointer transition-colors">
                        "I need to think about it and get back to you later."  
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="flex w-full">
                    <div 
                      className={`w-[85%] rounded-xl p-4 shadow-sm ${message.role === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-white border border-blue-100'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-1 mb-1">
                              <div className="bg-blue-100 p-1 rounded-full">
                                <Lightbulb className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-xs font-medium text-blue-700">AI Response</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handleCopyToClipboard(message.content, index)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ml-2"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="w-[85%] rounded-xl p-4 bg-white border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-700">Generating response...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="p-4 bg-white/80 backdrop-blur-sm border-t border-blue-100">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a customer objection here... (Type 'bye AI' to end)"
                className="w-full pr-12 min-h-[80px] border-blue-200 focus:border-blue-400 bg-white"
                rows={3}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                {isLoading ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <Send className="h-4 w-4" />
                }
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          className="text-sm text-blue-700 border-blue-200 hover:bg-blue-50"
          onClick={() => setMessages([])}
          disabled={messages.length === 0 || isLoading}
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Start New Conversation
        </Button>
      </div>
    </div>
  )
}
