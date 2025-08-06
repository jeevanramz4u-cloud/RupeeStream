import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, X, User, Headphones } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ChatWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages"],
    queryFn: () => fetch("/api/chat/messages?limit=50").then(res => res.json()),
    enabled: isOpen && !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      await apiRequest("POST", "/api/chat/messages", { message: text });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (isOpen && !socket) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to chat websocket');
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          }
        } catch (error) {
          console.error('Error parsing websocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from chat websocket');
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.close();
      };
    }
  }, [isOpen, socket, queryClient]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ping websocket to keep connection alive
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const interval = setInterval(() => {
        socket.send(JSON.stringify({ type: 'ping' }));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          className="bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <CardHeader className="p-4 border-b border-gray-100 bg-primary rounded-t-xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">Live Support</CardTitle>
                  <p className="text-xs text-primary-100">We're here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 p-1"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="h-64 overflow-y-auto p-0">
            <div className="space-y-3 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400">Start a conversation with our support team!</p>
                </div>
              ) : (
                messages.map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start space-x-2 ${msg.isAdmin ? 'justify-end' : ''}`}
                  >
                    {!msg.isAdmin && (
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={msg.user?.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          <User className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-xs rounded-lg p-2 text-sm ${
                      msg.isAdmin 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isAdmin ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                    
                    {msg.isAdmin && (
                      <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Headphones className="text-secondary w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
