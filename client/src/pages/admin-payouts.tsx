import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  Eye, 
  Check, 
  X, 
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Banknote
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPayouts() {
  const { isAdminAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingNote, setProcessingNote] = useState("");
  const payoutsPerPage = 20;

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

  // Get all payouts data
  const { data: payouts = [], isLoading: payoutsLoading, refetch: refetchPayouts } = useQuery({
    queryKey: ["/api/admin/payouts"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Filter payouts based on search and filters
  const filteredPayouts = payouts.filter((payout: any) => {
    const user = users.find((u: any) => u.id === payout.userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown User";
    const userEmail = user ? user.email : "";
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / payoutsPerPage);
  const startIndex = (currentPage - 1) * payoutsPerPage;
  const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + payoutsPerPage);

  // Mutation for updating payout status
  const updatePayoutMutation = useMutation({
    mutationFn: ({ payoutId, updates }: { payoutId: string; updates: any }) =>
      apiRequest("PUT", `/api/admin/payouts/${payoutId}`, updates),
    onSuccess: () => {
      toast({
        title: "Payout Updated",
        description: "Payout has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setDialogOpen(false);
      setSelectedPayout(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Batch processing mutation
  const batchProcessMutation = useMutation({
    mutationFn: ({ payoutIds, action }: { payoutIds: string[]; action: string }) =>
      apiRequest("POST", `/api/admin/payouts/batch`, { payoutIds, action }),
    onSuccess: () => {
      toast({
        title: "Batch Processing Complete",
        description: "Selected payouts have been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
    },
    onError: () => {
      toast({
        title: "Batch Processing Failed",
        description: "Failed to process selected payouts.",
        variant: "destructive",
      });
    },
  });

  const handleApprovePayout = (payoutId: string, note?: string) => {
    updatePayoutMutation.mutate({
      payoutId,
      updates: { 
        status: "approved", 
        note,
        approvedAt: new Date().toISOString()
      }
    });
  };

  const handleRejectPayout = (payoutId: string, reason: string) => {
    updatePayoutMutation.mutate({
      payoutId,
      updates: { 
        status: "rejected", 
        rejectionReason: reason,
        rejectedAt: new Date().toISOString()
      }
    });
  };

  const handleCompletePayout = (payoutId: string, transactionId?: string) => {
    updatePayoutMutation.mutate({
      payoutId,
      updates: { 
        status: "completed", 
        transactionId,
        completedAt: new Date().toISOString()
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-blue-500">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-yellow-500">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserInfo = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      kycStatus: user.kycStatus
    } : {
      name: "Unknown User",
      email: "N/A",
      kycStatus: "unknown"
    };
  };

  // Calculate stats
  const totalPayouts = payouts.length;
  const pendingPayouts = payouts.filter((p: any) => p.status === "pending").length;
  const completedPayouts = payouts.filter((p: any) => p.status === "completed").length;
  const totalAmount = payouts.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

  const exportPayouts = () => {
    const csvContent = [
      ["Payout ID", "User Name", "User Email", "Amount", "Status", "Created Date", "Completed Date"].join(","),
      ...filteredPayouts.map((payout: any) => {
        const userInfo = getUserInfo(payout.userId);
        return [
          payout.id,
          userInfo.name,
          userInfo.email,
          payout.amount,
          payout.status,
          new Date(payout.createdAt).toLocaleDateString(),
          payout.completedAt ? new Date(payout.completedAt).toLocaleDateString() : "N/A"
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/admin")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-2xl font-bold text-gray-900">Payout Management</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={exportPayouts} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => refetchPayouts()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-bold">{totalPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{pendingPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{completedPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search Payouts</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Results</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Showing {paginatedPayouts.length} of {filteredPayouts.length} payouts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayouts.map((payout: any) => {
                      const userInfo = getUserInfo(payout.userId);
                      return (
                        <TableRow key={payout.id}>
                          <TableCell className="font-mono text-sm">{payout.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{userInfo.name}</div>
                              <div className="text-sm text-gray-500">{userInfo.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{parseFloat(payout.amount || 0).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={userInfo.kycStatus === 'approved' ? 'default' : 'secondary'}>
                              {userInfo.kycStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout Management: {selectedPayout?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-6">
              {/* Basic Payout Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <p className="text-2xl font-bold text-green-600">₹{parseFloat(selectedPayout.amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                    </div>
                    <div>
                      <Label>Requested Date</Label>
                      <p className="text-sm">{new Date(selectedPayout.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label>User</Label>
                      <p className="text-sm">{getUserInfo(selectedPayout.userId).name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout Actions */}
              {selectedPayout.status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Processing Note (Optional)</Label>
                      <Textarea
                        placeholder="Add any notes about this payout..."
                        value={processingNote}
                        onChange={(e) => setProcessingNote(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          handleApprovePayout(selectedPayout.id, processingNote);
                          setProcessingNote("");
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Payout
                      </Button>
                      <Button
                        onClick={() => {
                          if (processingNote.trim()) {
                            handleRejectPayout(selectedPayout.id, processingNote);
                            setProcessingNote("");
                          } else {
                            toast({
                              title: "Rejection Reason Required",
                              description: "Please provide a reason for rejecting this payout.",
                              variant: "destructive"
                            });
                          }
                        }}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject Payout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mark as Completed */}
              {selectedPayout.status === "approved" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mark as Completed</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Transaction ID (Optional)</Label>
                      <Input
                        placeholder="Enter transaction reference ID..."
                        value={processingNote}
                        onChange={(e) => setProcessingNote(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        handleCompletePayout(selectedPayout.id, processingNote);
                        setProcessingNote("");
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}