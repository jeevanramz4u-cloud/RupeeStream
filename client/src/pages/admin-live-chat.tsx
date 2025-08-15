import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  Send, 
  X, 
  HelpCircle, 
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  UserPlus,
  Activity,
  Eye,
  User,
  Headphones,
  Star,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminLiveChat() {
  const { isAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("sessions");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [newTeamMember, setNewTeamMember] = useState({ name: "", email: "", role: "agent" });
  const [newFaqCategory, setNewFaqCategory] = useState({ name: "", description: "" });
  const [newFaq, setNewFaq] = useState({ categoryId: "", question: "", answer: "" });
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to admin login if not authenticated
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuth) {
    setLocation("/admin-login");
    return null;
  }

  // Get chat sessions
  const { data: chatSessions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/chat-sessions"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Get support team members
  const { data: supportTeam = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/support-team"],
  });

  // Get FAQ categories
  const { data: faqCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/faq-categories"],
  });

  // Get FAQs
  const { data: faqs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/faqs"],
  });

  // Get messages for selected session
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/chat-messages", selectedSession?.id],
    enabled: !!selectedSession?.id,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Get chat statistics
  const { data: chatStats } = useQuery<any>({
    queryKey: ["/api/admin/chat-stats"],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Assign session to agent
  const assignSessionMutation = useMutation({
    mutationFn: async ({ sessionId, agentId }: { sessionId: string; agentId: string }) => {
      const response = await apiRequest("POST", "/api/admin/assign-chat", { sessionId, agentId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-sessions"] });
      toast({
        title: "Session Assigned",
        description: "Chat session has been assigned to agent.",
      });
    },
  });

  // Send message as agent
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/admin/chat-message", data);
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-messages", selectedSession?.id] });
    },
  });

  // Invite team member
  const inviteTeamMemberMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const response = await apiRequest("POST", "/api/admin/invite-support", data);
      return response.json();
    },
    onSuccess: () => {
      setNewTeamMember({ name: "", email: "", role: "agent" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-team"] });
      toast({
        title: "Invitation Sent",
        description: "Team member invitation has been sent via email.",
      });
    },
  });

  // Create FAQ category
  const createFaqCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/admin/faq-category", data);
      return response.json();
    },
    onSuccess: () => {
      setNewFaqCategory({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq-categories"] });
      toast({
        title: "Category Created",
        description: "FAQ category has been created successfully.",
      });
    },
  });

  // Create FAQ
  const createFaqMutation = useMutation({
    mutationFn: async (data: { categoryId: string; question: string; answer: string }) => {
      const response = await apiRequest("POST", "/api/admin/faq", data);
      return response.json();
    },
    onSuccess: () => {
      setNewFaq({ categoryId: "", question: "", answer: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      toast({
        title: "FAQ Created",
        description: "FAQ item has been created successfully.",
      });
    },
  });

  // Update FAQ
  const updateFaqMutation = useMutation({
    mutationFn: async (data: { id: string; question: string; answer: string }) => {
      const response = await apiRequest("PUT", `/api/admin/faq/${data.id}`, {
        question: data.question,
        answer: data.answer,
      });
      return response.json();
    },
    onSuccess: () => {
      setEditingFaq(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      toast({
        title: "FAQ Updated",
        description: "FAQ item has been updated successfully.",
      });
    },
  });

  // Close chat session
  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", "/api/admin/close-chat", { sessionId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-sessions"] });
      setSelectedSession(null);
      toast({
        title: "Session Closed",
        description: "Chat session has been closed.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-green-100 text-green-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat Management</h1>
          <p className="text-gray-600">Manage customer support chats, team members, and FAQ system</p>
        </div>

        {/* Chat Statistics */}
        {chatStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Chats</p>
                    <p className="text-2xl font-bold">{chatStats.totalChats || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Waiting</p>
                    <p className="text-2xl font-bold text-yellow-600">{chatStats.waitingChats || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{chatStats.activeChats || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agents Online</p>
                    <p className="text-2xl font-bold text-purple-600">{chatStats.activeAgents || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions" data-testid="tab-sessions">Chat Sessions</TabsTrigger>
            <TabsTrigger value="team" data-testid="tab-team">Support Team</TabsTrigger>
            <TabsTrigger value="faqs" data-testid="tab-faqs">FAQ Management</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Chat Sessions Tab */}
          <TabsContent value="sessions" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Active Sessions</span>
                    <Badge variant="outline">{chatSessions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {chatSessions.map((session: any) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSession?.id === session.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{session.user?.firstName} {session.user?.lastName}</span>
                            <Badge className={getStatusColor(session.status)} variant="secondary">
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{session.subject || "General Support"}</span>
                            <Badge className={getPriorityColor(session.priority)} variant="secondary">
                              {session.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Started: {new Date(session.startedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  {selectedSession && (
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Chat with {selectedSession.user?.firstName} {selectedSession.user?.lastName}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {selectedSession.status === "waiting" && (
                          <Select
                            onValueChange={(agentId) => assignSessionMutation.mutate({ sessionId: selectedSession.id, agentId })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign Agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportTeam.map((agent: any) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closeSessionMutation.mutate(selectedSession.id)}
                          disabled={closeSessionMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="h-96 flex flex-col">
                      {/* Messages */}
                      <ScrollArea className="flex-1 border rounded-lg p-3 mb-4">
                        <div className="space-y-3">
                          {messages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderType === "user" ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                  msg.senderType === "user"
                                    ? "bg-gray-100 text-gray-900"
                                    : msg.senderType === "faq"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      {selectedSession.status !== "closed" && (
                        <div className="flex space-x-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                if (message.trim()) {
                                  sendMessageMutation.mutate({
                                    sessionId: selectedSession.id,
                                    message,
                                  });
                                }
                              }
                            }}
                            disabled={sendMessageMutation.isPending}
                          />
                          <Button
                            onClick={() => {
                              if (message.trim()) {
                                sendMessageMutation.mutate({
                                  sessionId: selectedSession.id,
                                  message,
                                });
                              }
                            }}
                            disabled={!message.trim() || sendMessageMutation.isPending}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a chat session to start messaging</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Team Tab */}
          <TabsContent value="team" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Members List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Support Team</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supportTeam.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{member.role}</Badge>
                            <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} variant="secondary">
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.lastActive && (
                            <p>Last: {new Date(member.lastActive).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Invite Team Member */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Invite Team Member</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="member-name">Name</Label>
                      <Input
                        id="member-name"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        placeholder="Enter team member name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-email">Email</Label>
                      <Input
                        id="member-email"
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-role">Role</Label>
                      <Select
                        value={newTeamMember.role}
                        onValueChange={(role) => setNewTeamMember({ ...newTeamMember, role })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => inviteTeamMemberMutation.mutate(newTeamMember)}
                      disabled={!newTeamMember.name || !newTeamMember.email || inviteTeamMemberMutation.isPending}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Management Tab */}
          <TabsContent value="faqs" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FAQ Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>FAQ Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Create Category */}
                    <div className="space-y-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Category name"
                        value={newFaqCategory.name}
                        onChange={(e) => setNewFaqCategory({ ...newFaqCategory, name: e.target.value })}
                      />
                      <Textarea
                        placeholder="Category description"
                        value={newFaqCategory.description}
                        onChange={(e) => setNewFaqCategory({ ...newFaqCategory, description: e.target.value })}
                        rows={2}
                      />
                      <Button
                        onClick={() => createFaqCategoryMutation.mutate(newFaqCategory)}
                        disabled={!newFaqCategory.name || createFaqCategoryMutation.isPending}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Category
                      </Button>
                    </div>

                    {/* Categories List */}
                    <div className="space-y-2">
                      {faqCategories.map((category: any) => (
                        <div key={category.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant="outline">
                              {faqs.filter((faq: any) => faq.categoryId === category.id).length} FAQs
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>FAQ Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Create FAQ */}
                    <div className="space-y-2 p-3 border rounded-lg">
                      <Select
                        value={newFaq.categoryId}
                        onValueChange={(categoryId) => setNewFaq({ ...newFaq, categoryId })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {faqCategories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Question"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      />
                      <Textarea
                        placeholder="Answer"
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        rows={3}
                      />
                      <Button
                        onClick={() => createFaqMutation.mutate(newFaq)}
                        disabled={!newFaq.categoryId || !newFaq.question || !newFaq.answer || createFaqMutation.isPending}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create FAQ
                      </Button>
                    </div>

                    {/* FAQs List */}
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {faqs.map((faq: any) => (
                          <div key={faq.id} className="p-3 border rounded-lg">
                            {editingFaq?.id === faq.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingFaq.question}
                                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                />
                                <Textarea
                                  value={editingFaq.answer}
                                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                                  rows={3}
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateFaqMutation.mutate(editingFaq)}
                                    disabled={updateFaqMutation.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingFaq(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm">{faq.question}</h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingFaq(faq)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    {faq.views || 0} views
                                  </span>
                                  <span className="flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    {faq.helpful || 0} helpful
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Chat Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Chat system settings and configuration will be available here.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Auto-assign chats</Label>
                      <div className="text-sm text-gray-500">
                        Automatically assign incoming chats to available agents
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum concurrent chats per agent</Label>
                      <div className="text-sm text-gray-500">
                        Set the maximum number of chats an agent can handle simultaneously
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}