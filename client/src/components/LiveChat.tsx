import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  MessageCircle, 
  Send, 
  X, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown, 
  User,
  Headphones,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveChatProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function LiveChat({ trigger, className }: LiveChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get FAQ categories and items
  const { data: faqCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/faq-categories"],
    enabled: isOpen,
  });

  const { data: faqs = [] } = useQuery<any[]>({
    queryKey: ["/api/faqs"],
    enabled: isOpen,
  });

  // Get current chat session
  const { data: chatSession, isLoading: sessionLoading } = useQuery<any>({
    queryKey: ["/api/chat-session"],
    enabled: isOpen && !!user,
  });

  // Get chat messages
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/chat-messages", chatSession?.id],
    enabled: !!chatSession?.id,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start new chat session
  const startChatMutation = useMutation({
    mutationFn: async (subject: string) => {
      const response = await apiRequest("POST", "/api/chat-session", { subject });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-session"] });
      setActiveTab("chat");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; faqId?: string }) => {
      const response = await apiRequest("POST", "/api/chat-message", {
        sessionId: chatSession.id,
        message: data.message,
        faqId: data.faqId,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages", chatSession?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Rate FAQ helpful/not helpful
  const rateFaqMutation = useMutation({
    mutationFn: async ({ faqId, helpful }: { faqId: string; helpful: boolean }) => {
      const response = await apiRequest("POST", "/api/faq-rating", { faqId, helpful });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  // Transfer to support agent
  const transferToAgentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/transfer-to-agent", {
        sessionId: chatSession.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transferred to Support",
        description: "You've been transferred to our support team. An agent will assist you shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat-session"] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !chatSession) return;
    sendMessageMutation.mutate({ message });
  };

  const handleFaqSelect = (faq: any) => {
    setSelectedFaq(faq.id);
    if (chatSession) {
      sendMessageMutation.mutate({
        message: faq.answer,
        faqId: faq.id,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "closed":
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderFaqContent = () => (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <HelpCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <h3 className="font-semibold text-blue-900">How can we help you?</h3>
        <p className="text-sm text-blue-700">Browse our frequently asked questions or start a live chat.</p>
      </div>

      {faqCategories.length > 0 && (
        <Accordion type="single" collapsible className="space-y-2">
          {faqCategories.map((category: any) => {
            const categoryFaqs = faqs.filter((faq: any) => faq.categoryId === category.id);
            
            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {categoryFaqs.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6">
                    {categoryFaqs.map((faq: any) => (
                      <div key={faq.id} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                        <p className="text-xs text-gray-600 mb-3">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rateFaqMutation.mutate({ faqId: faq.id, helpful: true })}
                              className="h-6 px-2"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {faq.helpful || 0}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rateFaqMutation.mutate({ faqId: faq.id, helpful: false })}
                              className="h-6 px-2"
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              {faq.notHelpful || 0}
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!chatSession) {
                                startChatMutation.mutate(`Question about: ${faq.question}`);
                              } else {
                                handleFaqSelect(faq);
                                setActiveTab("chat");
                              }
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Use in Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <div className="text-center pt-4">
        <Button
          onClick={() => {
            if (!chatSession) {
              startChatMutation.mutate("I need help with something not covered in FAQ");
            } else {
              setActiveTab("chat");
            }
          }}
          className="w-full"
          disabled={startChatMutation.isPending}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {chatSession ? "Continue Chat" : "Start Live Chat"}
        </Button>
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="h-96 flex flex-col">
      {/* Chat Header */}
      {chatSession && (
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            {getStatusIcon(chatSession.status)}
            <span className="font-medium text-sm">
              {chatSession.status === "waiting" && "Waiting for agent..."}
              {chatSession.status === "active" && `Chat with ${chatSession.assignedAgent?.name || "Support Agent"}`}
              {chatSession.status === "resolved" && "Chat resolved"}
              {chatSession.status === "closed" && "Chat closed"}
            </span>
          </div>
          {chatSession.status === "waiting" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => transferToAgentMutation.mutate()}
              disabled={transferToAgentMutation.isPending}
            >
              <Headphones className="w-3 h-3 mr-1" />
              Priority Support
            </Button>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  msg.senderType === "user"
                    ? "bg-primary text-primary-foreground"
                    : msg.senderType === "faq"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      {chatSession && chatSession.status !== "closed" && (
        <div className="border-t p-3">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!chatSession && (
        <div className="p-3 text-center">
          <Button
            onClick={() => startChatMutation.mutate("I need help")}
            disabled={startChatMutation.isPending}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className} data-testid="button-live-chat">
            <MessageCircle className="w-4 h-4 mr-2" />
            Live Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Support Center</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq" data-testid="tab-faq">FAQ</TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">Live Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="mt-4">
            {renderFaqContent()}
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4">
            {renderChatContent()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}