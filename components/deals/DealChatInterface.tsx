import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Plus } from 'lucide-react';
import { DealChatSession, DealChatMessage, Deal } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface DealChatInterfaceProps {
  deal: Deal;
  userId: string;
}

export function DealChatInterface({ deal, userId }: DealChatInterfaceProps) {
  const [sessions, setSessions] = useState<DealChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<DealChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch sessions for this deal
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Use the name field from the database, with fallback to title for backward compatibility
        const dealId = deal?.id;
        if (!dealId) return;
        
        setIsLoading(true);
        const response = await fetch(`/api/deals/${dealId}/chat/sessions`);
        const data = await response.json();
        if (data.data) {
          setSessions(data.data);
          // Set current session to the most recent one if available
          if (data.data.length > 0) {
            setCurrentSession(data.data[0].id);
          } else {
            // Automatically create a new session if none exists
            console.log('No sessions found, creating a new one...');
            await createNewSession();
          }
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat sessions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (deal?.id) {
      fetchSessions();
    }
  }, [deal?.id, currentSession, toast]);

  // Fetch messages when session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentSession) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/deals/chat/sessions/${currentSession}/messages`);
        const data = await response.json();
        if (data.data) {
          setMessages(data.data);
          scrollToBottom();
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSession) {
      fetchMessages();
    }
  }, [currentSession, toast]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      // Use a hardcoded UUID for now since we're not doing authentication
      const dummyUserId = userId || '00000000-0000-0000-0000-000000000000';
      
      const response = await fetch(`/api/deals/${deal?.id}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Chat about ${deal?.name || deal?.title || 'Deal'}`,
          createdBy: dummyUserId,
        }),
      });
      
      const data = await response.json();
      if (data.data) {
        setSessions([data.data, ...sessions]);
        setCurrentSession(data.data.id);
        setMessages([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;
    
    try {
      setIsLoading(true);
      
      // Optimistically update UI
      const tempUserMessage: DealChatMessage = {
        id: 'temp-' + Date.now(),
        session_id: currentSession,
        sender_type: 'user',
        content: inputValue,
        created_at: new Date().toISOString(),
      };
      
      setMessages([...messages, tempUserMessage]);
      setInputValue('');
      
      // Send to API
      const response = await fetch(`/api/deals/chat/sessions/${currentSession}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputValue,
        }),
      });
      
      const data = await response.json();
      if (data.data) {
        // Replace temp message with real one and add AI response
        setMessages(prev => 
          [...prev.filter(m => m.id !== tempUserMessage.id), 
           data.data.userMessage, 
           data.data.aiMessage]
        );
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with sessions */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Deal Coach AI</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={createNewSession}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      {/* Session selector */}
      {sessions.length > 0 && (
        <div className="flex overflow-x-auto p-2 gap-2 border-b">
          {sessions.map(session => (
            <Button
              key={session.id}
              variant={currentSession === session.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSession(session.id)}
            >
              {session.title || `Chat ${new Date(session.created_at).toLocaleDateString()}`}
            </Button>
          ))}
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {sessions.length === 0 
              ? "Create a new chat to get started" 
              : "No messages yet. Start the conversation!"}
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!currentSession) {
                  createNewSession().then(() => {
                    // Wait a bit for the session to be created, then send the message
                    setTimeout(() => sendMessage(), 500);
                  });
                } else {
                  sendMessage();
                }
              }
            }}
          />
          <Button 
            onClick={() => {
              if (!currentSession) {
                createNewSession().then(() => {
                  // Wait a bit for the session to be created, then send the message
                  setTimeout(() => sendMessage(), 500);
                });
              } else {
                sendMessage();
              }
            }} 
            disabled={isLoading || !inputValue.trim()}
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
