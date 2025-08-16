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
  Users, 
  Eye, 
  Edit, 
  Ban, 
  Check, 
  X, 
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { isAdminAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [suspensionReason, setSuspensionReason] = useState("");
  const usersPerPage = 20;

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

  // Get all users with comprehensive data
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdminAuth,
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  // Get user earnings and activity data
  const { data: userEarnings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/user-earnings"],
    enabled: isAdminAuth,
    queryFn: async () => {
      const res = await fetch("/api/admin/earnings", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const { data: userTasks = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/user-tasks"],
    enabled: isAdminAuth,
    queryFn: async () => {
      const res = await fetch("/api/admin/task-completions", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesKyc = kycFilter === "all" || user.kycStatus === kycFilter;
    
    return matchesSearch && matchesStatus && matchesKyc;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Mutation for updating user status
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      apiRequest("PUT", `/api/admin/users/${userId}`, updates),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // KYC approval mutation
  const updateKycMutation = useMutation({
    mutationFn: ({ userId, status, note }: { userId: string; status: string; note?: string }) =>
      apiRequest("PUT", `/api/admin/users/${userId}/kyc`, { status, note }),
    onSuccess: () => {
      toast({
        title: "KYC Status Updated",
        description: "KYC verification status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "KYC Update Failed",
        description: "Failed to update KYC status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSuspendUser = (userId: string, reason: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { 
        status: "suspended", 
        suspensionReason: reason,
        suspendedAt: new Date().toISOString()
      }
    });
  };

  const handleActivateUser = (userId: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { 
        status: "active", 
        suspensionReason: null,
        suspendedAt: null
      }
    });
  };

  const handleKycApproval = (userId: string, status: "approved" | "rejected", note?: string) => {
    updateKycMutation.mutate({ userId, status, note });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKycBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case "submitted":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{kycStatus}</Badge>;
    }
  };

  const getUserEarnings = (userId: string) => {
    const earnings = userEarnings.filter((e: any) => e.userId === userId);
    return earnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
  };

  const getUserTaskCount = (userId: string) => {
    return userTasks.filter((t: any) => t.userId === userId).length;
  };

  const exportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Status", "KYC Status", "Balance", "Earnings", "Tasks Completed", "Created Date"].join(","),
      ...filteredUsers.map((user: any) => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.status,
        user.kycStatus,
        user.balance || 0,
        getUserEarnings(user.id),
        getUserTaskCount(user.id),
        new Date(user.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
                <ChevronLeft className="h-3 h-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Back to Dashboard</span>
              </Button>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">User Management</div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button onClick={exportUsers} variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                <Download className="h-3 h-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button onClick={() => refetchUsers()} variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                <RefreshCw className="h-3 h-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                  <p className="text-lg sm:text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active Users</p>
                  <p className="text-lg sm:text-2xl font-bold">{users.filter((u: any) => u.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">KYC Approved</p>
                  <p className="text-2xl font-bold">{users.filter((u: any) => u.kycStatus === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold">{users.filter((u: any) => u.kycStatus === 'submitted').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>KYC Filter</Label>
                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All KYC Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="submitted">Pending Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Results</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Showing {paginatedUsers.length} of {filteredUsers.length} users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">User</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">KYC Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Balance</TableHead>
                        <TableHead className="hidden lg:table-cell">Earnings</TableHead>
                        <TableHead className="hidden xl:table-cell">Tasks</TableHead>
                        <TableHead className="hidden xl:table-cell">Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="min-w-[150px]">
                          <div>
                            <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            <div className="sm:hidden mt-1 space-y-1">
                              {getStatusBadge(user.status)}
                              <div className="md:hidden">{getKycBadge(user.kycStatus)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getKycBadge(user.kycStatus)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">₹{parseFloat(user.balance || 0).toLocaleString()}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">₹{getUserEarnings(user.id).toLocaleString()}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">{getUserTaskCount(user.id)}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Management: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label>Created Date</Label>
                      <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Status: {getStatusBadge(selectedUser.status)}</p>
                      {selectedUser.suspensionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {selectedUser.suspensionReason}
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      {selectedUser.status === "suspended" ? (
                        <Button
                          onClick={() => handleActivateUser(selectedUser.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Activate User
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter suspension reason..."
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                            className="w-64"
                          />
                          <Button
                            onClick={() => {
                              if (suspensionReason.trim()) {
                                handleSuspendUser(selectedUser.id, suspensionReason);
                                setSuspensionReason("");
                              }
                            }}
                            variant="destructive"
                            disabled={!suspensionReason.trim()}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">KYC Status: {getKycBadge(selectedUser.kycStatus)}</p>
                      {selectedUser.kycSubmittedAt && (
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(selectedUser.kycSubmittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {selectedUser.kycStatus === "submitted" && (
                      <div className="space-x-2">
                        <Button
                          onClick={() => handleKycApproval(selectedUser.id, "approved")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve KYC
                        </Button>
                        <Button
                          onClick={() => handleKycApproval(selectedUser.id, "rejected", "Documents not clear")}
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject KYC
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Current Balance</Label>
                      <p className="text-2xl font-bold">₹{parseFloat(selectedUser.balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Total Earnings</Label>
                      <p className="text-2xl font-bold">₹{getUserEarnings(selectedUser.id).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Tasks Completed</Label>
                      <p className="text-2xl font-bold">{getUserTaskCount(selectedUser.id)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}