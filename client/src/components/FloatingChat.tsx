import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FaqCategory {
  id: string;
  name: string;
  description: string;
}

interface Faq {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
  views: number;
}

interface ChatSession {
  id: string;
  userId: string;
  assignedAgentId?: string;
  status: "waiting" | "active" | "closed";
  subject: string;
  startedAt: string;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: "user" | "agent" | "system" | "faq";
  message: string;
  faqId?: string;
  timestamp: string;
  isRead: boolean;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"faq" | "chat">("faq");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch FAQ categories
  const { data: faqCategories = [] } = useQuery<FaqCategory[]>({
    queryKey: ["/api/faq-categories"],
    enabled: isOpen && currentView === "faq",
  });

  // Fetch FAQs
  const { data: faqs = [] } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
    enabled: isOpen && currentView === "faq",
  });

  // Fetch chat session
  const { data: session, refetch: refetchSession } = useQuery<ChatSession | null>({
    queryKey: ["/api/chat-session"],
    enabled: isOpen && currentView === "chat",
  });

  // Fetch chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages", session?.id],
    enabled: !!session?.id,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Create chat session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: { subject?: string }) => 
      apiRequest("POST", "/api/chat-session", data),
    onSuccess: (data) => {
      setChatSession(data);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-session"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { sessionId: string; message: string; faqId?: string }) =>
      apiRequest("POST", "/api/chat-message", data),
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
    },
  });

  // Rate FAQ mutation
  const rateFaqMutation = useMutation({
    mutationFn: (data: { faqId: string; helpful: boolean }) =>
      apiRequest("POST", "/api/faq-rating", data),
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our FAQ.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  // Transfer to agent mutation
  const transferToAgentMutation = useMutation({
    mutationFn: (data: { sessionId: string }) =>
      apiRequest("POST", "/api/transfer-to-agent", data),
    onSuccess: () => {
      toast({
        title: "Transferred to Support",
        description: "A support agent will assist you shortly.",
      });
      refetchMessages();
      refetchSession();
    },
  });

  useEffect(() => {
    if (session) {
      setChatSession(session);
    }
  }, [session]);

  useEffect(() => {
    // Check for unread messages
    if (messages.length > 0 && !isOpen) {
      const unread = messages.some(m => !m.isRead && m.senderType === "agent");
      setHasUnreadMessages(unread);
    }
  }, [messages, isOpen]);

  const filteredFaqs = selectedCategory
    ? faqs.filter(faq => faq.categoryId === selectedCategory)
    : [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatSession) return;

    sendMessageMutation.mutate({
      sessionId: chatSession.id,
      message: newMessage.trim(),
    });
  };

  const handleStartChat = (subject = "General Support") => {
    createSessionMutation.mutate({ subject });
    setCurrentView("chat");
  };

  const handleFaqSelect = (faq: Faq) => {
    setSelectedFaq(faq);
  };

  const handleFaqRating = (faqId: string, helpful: boolean) => {
    rateFaqMutation.mutate({ faqId, helpful });
  };

  const handleTransferToAgent = () => {
    if (!chatSession) return;
    transferToAgentMutation.mutate({ sessionId: chatSession.id });
  };

  const handleSendFaqAsMessage = (faq: Faq) => {
    if (!chatSession) {
      // Create a new session first
      handleStartChat("FAQ Question");
      return;
    }

    sendMessageMutation.mutate({
      sessionId: chatSession.id,
      message: `Question: ${faq.question}\n\nAnswer: ${faq.answer}`,
      faqId: faq.id,
    });
    setCurrentView("chat");
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 animate-pulse relative"
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-7 w-7 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
          
          {hasUnreadMessages && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce shadow-lg">
              <div className="w-full h-full bg-red-400 rounded-full animate-ping" />
            </div>
          )}
          
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg">
            <div className="w-full h-full bg-green-300 rounded-full animate-pulse" />
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none backdrop-blur-sm">
          💬 Live Support - We're Online!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 shadow-2xl border-0 bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-semibold">
                {currentView === "faq" ? "Help & FAQ" : "Live Support"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button
              variant={currentView === "faq" ? "secondary" : "ghost"}
              size="sm"
              className={`text-white border-white/30 ${currentView === "faq" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => {
                setCurrentView("faq");
                setSelectedCategory(null);
                setSelectedFaq(null);
              }}
              data-testid="button-faq-tab"
            >
              FAQ
            </Button>
            <Button
              variant={currentView === "chat" ? "secondary" : "ghost"}
              size="sm"
              className={`text-white border-white/30 ${currentView === "chat" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setCurrentView("chat")}
              data-testid="button-chat-tab"
            >
              Live Chat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-gradient-to-b from-gray-50 to-white">
          <ScrollArea className="h-64 px-4">
            {currentView === "faq" && (
              <div className="space-y-3">
                {!selectedCategory && !selectedFaq && (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Browse frequently asked questions or start a live chat.
                    </p>
                    {faqCategories.map((category) => (
                      <div
                        key={category.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCategory(category.id)}
                        data-testid={`category-${category.id}`}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => handleStartChat()}
                      className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-start-chat"
                    >
                      🚀 Start Live Chat
                    </Button>
                  </>
                )}

                {selectedCategory && !selectedFaq && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedCategory(null)}
                      className="mb-3 p-0 h-auto"
                      data-testid="button-back-categories"
                    >
                      ← Back to categories
                    </Button>
                    {filteredFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => handleFaqSelect(faq)}
                        data-testid={`faq-${faq.id}`}
                      >
                        <div className="font-medium text-sm">{faq.question}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {faq.views} views
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {faq.helpful} helpful
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {selectedFaq && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedFaq(null)}
                      className="mb-3 p-0 h-auto"
                      data-testid="button-back-faqs"
                    >
                      ← Back to questions
                    </Button>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">{selectedFaq.question}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedFaq.answer}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-muted-foreground">Was this helpful?</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFaqRating(selectedFaq.id, true)}
                            data-testid="button-faq-helpful"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFaqRating(selectedFaq.id, false)}
                            data-testid="button-faq-not-helpful"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleSendFaqAsMessage(selectedFaq)}
                        className="w-full"
                        data-testid="button-discuss-faq"
                      >
                        Still need help? Discuss with support
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentView === "chat" && (
              <div className="space-y-3">
                {!chatSession && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Start a conversation with our support team
                    </p>
                    <Button
                      onClick={() => handleStartChat()}
                      data-testid="button-create-chat-session"
                    >
                      Start Chat
                    </Button>
                  </div>
                )}

                {chatSession && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            chatSession.status === "active"
                              ? "default"
                              : chatSession.status === "waiting"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {chatSession.status}
                        </Badge>
                        {chatSession.status === "waiting" && (
                          <span className="text-xs text-muted-foreground">
                            Waiting for agent...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                      {messages.map((message) => (
                        <div key={message.id} className="space-y-2">
                          <div
                            className={`p-2 rounded text-sm ${
                              message.senderType === "user"
                                ? "bg-primary text-primary-foreground ml-4"
                                : message.senderType === "faq"
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mr-2"
                                : message.senderType === "system"
                                ? "bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 mr-2"
                                : "bg-muted mr-4"
                            }`}
                            data-testid={`message-${message.id}`}
                          >
                            {message.senderType === "faq" && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600 text-xs font-medium">🤖 FAQ Assistant</span>
                              </div>
                            )}
                            {message.senderType === "system" && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-orange-600 text-xs font-medium">👥 Support System</span>
                              </div>
                            )}
                            <div className="whitespace-pre-line">{message.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          
                          {/* Show transfer button for system messages that suggest transfer */}
                          {message.suggestTransfer && (
                            <div className="flex justify-center">
                              <Button
                                onClick={handleTransferToAgent}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs"
                                data-testid="button-transfer-to-agent"
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Transfer to Support Team
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {chatSession.status === "waiting" && (
                      <div className="text-center py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTransferToAgent}
                          data-testid="button-transfer-agent"
                        >
                          Request Priority Support
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          {currentView === "chat" && chatSession && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}