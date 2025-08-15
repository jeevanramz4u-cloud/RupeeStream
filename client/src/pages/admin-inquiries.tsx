import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  MessageSquare2, 
  Eye, 
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminInquiries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

  const { data: advertiserInquiries = [], isLoading: loadingAdvertisers } = useQuery({
    queryKey: ["/api/advertiser-inquiries"],
    enabled: !!user,
  });

  const { data: contactInquiries = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["/api/contact-inquiries"],
    enabled: !!user,
  });

  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, type, updates }: { id: string; type: 'advertiser' | 'contact'; updates: any }) =>
      apiRequest("PUT", type === 'advertiser' ? `/api/advertiser-inquiry/${id}` : `/api/contact-inquiry/${id}`, updates),
    onSuccess: () => {
      toast({
        title: "Inquiry Updated",
        description: "The inquiry has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contact-inquiries"] });
      setDialogOpen(false);
      setSelectedInquiry(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: string, type: 'advertiser' | 'contact', status: string) => {
    updateInquiryMutation.mutate({
      id,
      type,
      updates: { status }
    });
  };

  const handleViewInquiry = (inquiry: any, type: 'advertiser' | 'contact') => {
    setSelectedInquiry({ ...inquiry, type });
    setResponseText(inquiry.adminResponse || "");
    setDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!selectedInquiry) return;
    
    const updates = selectedInquiry.type === 'contact' 
      ? { 
          status: 'responded',
          adminResponse: responseText,
          responseDate: new Date().toISOString(),
          assignedTo: user?.id
        }
      : {
          status: 'contacted',
          notes: responseText,
          assignedTo: user?.id
        };

    updateInquiryMutation.mutate({
      id: selectedInquiry.id,
      type: selectedInquiry.type,
      updates
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
      contacted: { variant: "default" as const, label: "Contacted", icon: CheckCircle },
      in_progress: { variant: "default" as const, label: "In Progress", icon: AlertCircle },
      responded: { variant: "default" as const, label: "Responded", icon: CheckCircle },
      resolved: { variant: "default" as const, label: "Resolved", icon: CheckCircle },
      completed: { variant: "default" as const, label: "Completed", icon: CheckCircle },
      closed: { variant: "outline" as const, label: "Closed", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInquiryTypeBadge = (type: string) => {
    const typeConfig = {
      general: { label: "General", className: "bg-blue-100 text-blue-800" },
      support: { label: "Support", className: "bg-orange-100 text-orange-800" },
      business: { label: "Business", className: "bg-green-100 text-green-800" },
      complaint: { label: "Complaint", className: "bg-red-100 text-red-800" },
      suggestion: { label: "Suggestion", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.general;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Inquiries</h1>
          <p className="text-gray-600">Manage advertiser and contact inquiries</p>
        </div>

        <Tabs defaultValue="advertisers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advertisers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Advertiser Inquiries ({advertiserInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageSquare2 className="w-4 h-4" />
              Contact Inquiries ({contactInquiries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advertisers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Advertiser Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAdvertisers ? (
                  <div className="text-center py-8">Loading...</div>
                ) : advertiserInquiries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No advertiser inquiries found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Campaign Budget</TableHead>
                          <TableHead>Task Types</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {advertiserInquiries.map((inquiry: any) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{inquiry.companyName}</div>
                                <div className="text-sm text-gray-500">{inquiry.industry}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{inquiry.contactPerson}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {inquiry.email}
                                </div>
                                {inquiry.phone && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {inquiry.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{inquiry.campaignBudget}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {inquiry.taskTypes?.slice(0, 2).map((type: string) => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </Badge>
                                ))}
                                {inquiry.taskTypes?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{inquiry.taskTypes.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(inquiry.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewInquiry(inquiry, 'advertiser')}
                                  data-testid={`button-view-advertiser-${inquiry.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Select
                                  value={inquiry.status}
                                  onValueChange={(status) => handleUpdateStatus(inquiry.id, 'advertiser', status)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare2 className="w-5 h-5" />
                  Contact Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingContacts ? (
                  <div className="text-center py-8">Loading...</div>
                ) : contactInquiries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No contact inquiries found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactInquiries.map((inquiry: any) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{inquiry.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {inquiry.email}
                                </div>
                                {inquiry.phone && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {inquiry.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-48">
                                <div className="font-medium truncate">{inquiry.subject}</div>
                                <div className="text-sm text-gray-500 truncate">{inquiry.message}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getInquiryTypeBadge(inquiry.inquiryType)}</TableCell>
                            <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(inquiry.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewInquiry(inquiry, 'contact')}
                                  data-testid={`button-view-contact-${inquiry.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Select
                                  value={inquiry.status}
                                  onValueChange={(status) => handleUpdateStatus(inquiry.id, 'contact', status)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="responded">Responded</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Inquiry Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedInquiry?.type === 'advertiser' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <MessageSquare2 className="w-5 h-5" />
              )}
              {selectedInquiry?.type === 'advertiser' ? 'Advertiser Inquiry Details' : 'Contact Inquiry Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              {selectedInquiry.type === 'advertiser' ? (
                // Advertiser Inquiry Details
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Company Name</Label>
                      <div className="text-sm">{selectedInquiry.companyName}</div>
                    </div>
                    <div>
                      <Label className="font-medium">Contact Person</Label>
                      <div className="text-sm">{selectedInquiry.contactPerson}</div>
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedInquiry.email}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Phone</Label>
                      <div className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedInquiry.phone}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Website</Label>
                      <div className="text-sm">
                        {selectedInquiry.website ? (
                          <a href={selectedInquiry.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                            {selectedInquiry.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Industry</Label>
                      <div className="text-sm">{selectedInquiry.industry}</div>
                    </div>
                    <div>
                      <Label className="font-medium">Campaign Budget</Label>
                      <div className="text-sm">{selectedInquiry.campaignBudget}</div>
                    </div>
                    <div>
                      <Label className="font-medium">Campaign Duration</Label>
                      <div className="text-sm">{selectedInquiry.campaignDuration}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Task Types</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedInquiry.taskTypes?.map((type: string) => (
                        <Badge key={type} variant="outline">
                          {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Campaign Objective</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded border mt-1">
                      {selectedInquiry.campaignObjective}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Target Audience</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded border mt-1">
                      {selectedInquiry.targetAudience}
                    </div>
                  </div>

                  {selectedInquiry.additionalRequirements && (
                    <div>
                      <Label className="font-medium">Additional Requirements</Label>
                      <div className="text-sm bg-gray-50 p-3 rounded border mt-1">
                        {selectedInquiry.additionalRequirements}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Contact Inquiry Details
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Name</Label>
                      <div className="text-sm">{selectedInquiry.name}</div>
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedInquiry.email}
                      </div>
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <Label className="font-medium">Phone</Label>
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedInquiry.phone}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="font-medium">Inquiry Type</Label>
                      <div className="text-sm">{getInquiryTypeBadge(selectedInquiry.inquiryType)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Subject</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded border mt-1">
                      {selectedInquiry.subject}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Message</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded border mt-1">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  {selectedInquiry.adminResponse && (
                    <div>
                      <Label className="font-medium">Previous Admin Response</Label>
                      <div className="text-sm bg-blue-50 p-3 rounded border mt-1">
                        {selectedInquiry.adminResponse}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Response/Notes Section */}
              <div className="border-t pt-4">
                <Label htmlFor="response" className="font-medium">
                  {selectedInquiry.type === 'advertiser' ? 'Internal Notes' : 'Response to Customer'}
                </Label>
                <Textarea
                  id="response"
                  placeholder={
                    selectedInquiry.type === 'advertiser' 
                      ? "Add internal notes about this inquiry..."
                      : "Type your response to the customer..."
                  }
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="mt-2 min-h-24"
                  data-testid="textarea-admin-response"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || updateInquiryMutation.isPending}
                  data-testid="button-send-response"
                >
                  {updateInquiryMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}