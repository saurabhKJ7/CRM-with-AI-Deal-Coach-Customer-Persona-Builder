import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, HistoryIcon } from 'lucide-react';
import { Deal } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { DirectConversation } from '@/lib/services/direct-conversation.service';

interface DirectDealCoachProps {
  deal: Deal;
}

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'ai';
  created_at: string;
}

interface ConversationPair {
  id: string;
  userMessage: Message;
  aiMessage: Message;
}

export function DirectDealCoach({ deal }: DirectDealCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation history when deal changes
  useEffect(() => {
    if (deal?.id) {
      loadConversationHistory();
    }
  }, [deal?.id]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    if (!deal?.id) return;
    
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/deals/${deal.id}/direct-conversations`);
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Flatten all messages from all conversations into a single array
        const messagesFromHistory: Message[] = [];
        
        data.data.forEach((conv: { id: string, messages: Message[] }) => {
          // Add all messages from this conversation
          if (conv.messages && Array.isArray(conv.messages)) {
            messagesFromHistory.push(...conv.messages);
          }
        });
        
        // Sort messages by created_at
        messagesFromHistory.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setMessages(messagesFromHistory);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !deal?.id || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Check if user wants to end the conversation
    const endKeywords = ['bye', 'end', 'exit', 'quit', 'finish'];
    const isEndingConversation = endKeywords.some(keyword => 
      userMessage.toLowerCase() === keyword
    );
    
    // Add user message to the UI immediately
    const tempUserMsgId = `temp-user-${Date.now()}`;
    const newUserMessage: Message = {
      id: tempUserMsgId,
      content: userMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await fetch(`/api/deals/${deal.id}/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          isEndingConversation: isEndingConversation 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update messages with the response from the API
      setMessages(prev => {
        // Replace the temporary user message with the real one
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMsgId);
        return [...withoutTemp, data.data.userMessage, data.data.aiMessage];
      });
      
      // If the user is ending the conversation, show a toast notification
      if (isEndingConversation) {
        toast({
          title: 'Conversation Saved',
          description: 'Your conversation has been saved successfully.',
          variant: 'default',
        });
        
        // Optionally, you could clear the messages here if you want to start fresh
        // setMessages([]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isLoadingHistory ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading conversation history...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Start a conversation with the AI Coach about this deal
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
