import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
// Admin page uses its own header, not the regular user header
import { ObjectUploader } from "../components/ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Shield,
  Ban,
  RotateCcw,
  LogOut
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";

export default function Admin() {
  const { adminUser, isLoading: isAdminLoading, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [showNewVideoForm, setShowNewVideoForm] = useState(false);

  // Check admin authentication
  useEffect(() => {
    if (!isAdminLoading && !isAuthenticated) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/admin-login');
      }, 1000);
    }
  }, [isAuthenticated, isAdminLoading, toast, setLocation]);

  // Show loading or redirect if not authenticated
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500">Redirecting to admin login...</p>
        </div>
      </div>
    );
  }

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
    enabled: isAuthenticated,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["/api/admin/payouts"],
    enabled: isAuthenticated,
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated,
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/verification`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User verification status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update user verification",
        variant: "destructive",
      });
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  // User suspension/unsuspension mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Balance update mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/balance`, { amount });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User balance updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive",
      });
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async (videoData: any) => {
      await apiRequest("POST", "/api/videos", videoData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setShowNewVideoForm(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ videoId, updates }: { videoId: string; updates: any }) => {
      await apiRequest("PUT", `/api/videos/${videoId}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setEditingVideo(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const onSubmitVideo = (data: any) => {
    if (editingVideo) {
      updateVideoMutation.mutate({
        videoId: editingVideo.id,
        updates: data,
      });
    } else {
      createVideoMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-secondary text-white"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  // Admin authentication is handled above - this check is no longer needed

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">EarnPay Admin</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">
                Welcome, {(adminUser as any)?.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => {
                  // Logout functionality
                  fetch("/api/admin/logout", { method: "POST", credentials: "include" })
                    .then(() => {
                      toast({
                        title: "Logged out",
                        description: "You have been logged out successfully",
                      });
                      setLocation("/admin-login");
                    });
                }}
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage users, videos, and platform operations.</p>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          {/* Mobile: Scrollable tabs */}
          <div className="sm:hidden">
            <div className="flex overflow-x-auto space-x-2 px-1 pb-2 scrollbar-hide">
              <TabsTrigger value="users" className="text-xs whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="profiles" className="text-xs whitespace-nowrap">Profiles</TabsTrigger>
              <TabsTrigger value="videos" className="text-xs whitespace-nowrap">Videos</TabsTrigger>
              <TabsTrigger value="payouts" className="text-xs whitespace-nowrap">Payouts</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs whitespace-nowrap">Analytics</TabsTrigger>
            </div>
          </div>
          
          {/* Desktop: Grid tabs */}
          <TabsList className="hidden sm:grid w-full grid-cols-5">
            <TabsTrigger value="users">User Verification</TabsTrigger>
            <TabsTrigger value="profiles">User Profiles</TabsTrigger>
            <TabsTrigger value="videos">Video Management</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {(users as any[]).length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pending verifications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(users as any[]).map((user: any) => (
                        <div 
                          key={user.id}
                          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {getStatusBadge(user.verificationStatus)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Details */}
              <Card>
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedUser ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a user to view details</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Name</Label>
                            <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="text-gray-900">{selectedUser.email}</p>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <p className="text-gray-900">{selectedUser.phoneNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label>Date of Birth</Label>
                            <p className="text-gray-900">
                              {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString('en-IN') : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            {getStatusBadge(selectedUser.verificationStatus)}
                          </div>
                          <div>
                            <Label>Balance</Label>
                            <p className="text-gray-900">₹{selectedUser.balance || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Address Information</h3>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p><strong>Address:</strong> {selectedUser.address || 'Not provided'}</p>
                          <p><strong>City:</strong> {selectedUser.city || 'Not provided'}</p>
                          <p><strong>State:</strong> {selectedUser.state || 'Not provided'}</p>
                          <p><strong>PIN Code:</strong> {selectedUser.pincode || 'Not provided'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Bank Details</h3>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p><strong>Account Holder:</strong> {selectedUser.accountHolderName || 'Not provided'}</p>
                          <p><strong>Account Number:</strong> {selectedUser.accountNumber ? `****${selectedUser.accountNumber.slice(-4)}` : 'Not provided'}</p>
                          <p><strong>IFSC Code:</strong> {selectedUser.ifscCode || 'Not provided'}</p>
                          <p><strong>Bank Name:</strong> {selectedUser.bankName || 'Not provided'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Government ID Details</h3>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p><strong>ID Type:</strong> {selectedUser.governmentIdType || 'Not provided'}</p>
                          <p><strong>ID Number:</strong> {selectedUser.governmentIdNumber ? `****${selectedUser.governmentIdNumber.slice(-4)}` : 'Not provided'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Government ID</h3>
                        {selectedUser.governmentIdUrl ? (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <a 
                              href={selectedUser.governmentIdUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Government ID Document
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-500">No ID document uploaded</p>
                        )}
                      </div>

                      {selectedUser.verificationStatus === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-secondary hover:bg-secondary/90"
                            onClick={() => verifyUserMutation.mutate({
                              userId: selectedUser.id,
                              status: 'verified'
                            })}
                            disabled={verifyUserMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => verifyUserMutation.mutate({
                              userId: selectedUser.id,
                              status: 'rejected'
                            })}
                            disabled={verifyUserMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profiles">
            <div className="space-y-6">
              {/* User Profiles Management Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">User Profile Management</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/admin/create-demo-users", {
                          method: "POST",
                          credentials: "include"
                        });
                        const result = await response.json();
                        toast({
                          title: "Success",
                          description: "Demo users created successfully",
                        });
                        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to create demo users",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Create Demo Users
                  </Button>
                  <Input
                    placeholder="Search users by email or name..."
                    className="w-80"
                    onChange={(e) => {
                      // Add search functionality here if needed
                    }}
                  />
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 gap-6">
                {(users as any[]).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  (users as any[]).map((user: any) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>{user.firstName} {user.lastName}</span>
                              {getStatusBadge(user.verificationStatus)}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'}>
                              {user.status === 'suspended' ? 'Suspended' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Account Status</Label>
                            <p className="text-xs sm:text-sm font-medium">
                              {user.status === 'suspended' ? 'Suspended' : 'Active'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Verification</Label>
                            <p className="text-xs sm:text-sm font-medium capitalize">{user.verificationStatus}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Balance</Label>
                            <p className="text-xs sm:text-sm font-medium">₹{user.balance || 0}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Joined Date</Label>
                            <p className="text-xs sm:text-sm font-medium">{formatDate(user.createdAt)}</p>
                          </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Bank Details</h4>
                          {user.bankDetails ? (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{user.bankDetails}</pre>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">No bank details provided</p>
                          )}
                        </div>

                        {/* Government ID Section */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Government ID</h4>
                          {user.governmentIdUrl ? (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <a 
                                href={user.governmentIdUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View Government ID Document
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">No ID document uploaded</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t">
                          {/* Verification Actions */}
                          {user.verificationStatus === 'pending' && (
                            <>
                              <Button 
                                size="sm"
                                className="bg-secondary hover:bg-secondary/90 text-white text-xs"
                                onClick={() => verifyUserMutation.mutate({
                                  userId: user.id,
                                  status: 'verified'
                                })}
                                disabled={verifyUserMutation.isPending}
                              >
                                <CheckCircle className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                              <Button 
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                onClick={() => verifyUserMutation.mutate({
                                  userId: user.id,
                                  status: 'rejected'
                                })}
                                disabled={verifyUserMutation.isPending}
                              >
                                <XCircle className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline">Reject</span>
                              </Button>
                            </>
                          )}

                          {/* Suspension Actions */}
                          {user.status !== 'suspended' ? (
                            <Button 
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                              onClick={() => suspendUserMutation.mutate({
                                userId: user.id,
                                status: 'suspended'
                              })}
                              disabled={suspendUserMutation.isPending}
                            >
                              <Ban className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Suspend</span>
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => suspendUserMutation.mutate({
                                userId: user.id,
                                status: 'active'
                              })}
                              disabled={suspendUserMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Unsuspend</span>
                            </Button>
                          )}

                          {/* Balance Management */}
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const amount = prompt('Enter amount to add/subtract (use negative for deduction):');
                              if (amount) {
                                updateBalanceMutation.mutate({
                                  userId: user.id,
                                  amount: parseFloat(amount)
                                });
                              }
                            }}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Adjust Balance
                          </Button>

                          {/* Reset Verification */}
                          {user.verificationStatus !== 'pending' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => verifyUserMutation.mutate({
                                userId: user.id,
                                status: 'pending'
                              })}
                              disabled={verifyUserMutation.isPending}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reset Verification
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="space-y-4 sm:space-y-6">
              {/* Video Management Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Video Management</h2>
                <Button size="sm" onClick={() => setShowNewVideoForm(true)}>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Video</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              {/* New/Edit Video Form */}
              {(showNewVideoForm || editingVideo) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingVideo ? 'Edit Video' : 'Add New Video'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmitVideo)} className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="title" className="text-sm">Title</Label>
                          <Input
                            {...register("title", { required: true })}
                            defaultValue={editingVideo?.title}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-sm">Category</Label>
                          <Input
                            {...register("category")}
                            defaultValue={editingVideo?.category}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Textarea
                          {...register("description")}
                          defaultValue={editingVideo?.description}
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="url" className="text-sm">Video URL</Label>
                          <Input
                            {...register("url", { required: true })}
                            defaultValue={editingVideo?.url}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration" className="text-sm">Duration (seconds)</Label>
                          <Input
                            type="number"
                            {...register("duration", { required: true })}
                            defaultValue={editingVideo?.duration}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="earning" className="text-sm">Earning Amount (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register("earning", { required: true })}
                            defaultValue={editingVideo?.earning}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="thumbnailUrl" className="text-sm">Thumbnail URL</Label>
                        <Input
                          {...register("thumbnailUrl")}
                          defaultValue={editingVideo?.thumbnailUrl}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:space-x-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => {
                            setShowNewVideoForm(false);
                            setEditingVideo(null);
                            reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          size="sm"
                          className="text-xs sm:text-sm"
                          disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                        >
                          {editingVideo ? 'Update Video' : 'Create Video'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Videos List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  {(videos as any[]).length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No videos added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(videos as any[]).map((video: any) => (
                        <div key={video.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{video.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {video.views} views
                                </span>
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  ₹{video.earning}
                                </span>
                                {video.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {video.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-row sm:flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingVideo(video);
                                  reset(video);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this video?')) {
                                    deleteVideoMutation.mutate(video.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {(payouts as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payout requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(payouts as any[]).map((payout: any) => (
                      <div key={payout.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">₹{payout.amount}</p>
                            <p className="text-sm text-gray-600">
                              User ID: {payout.userId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested: {formatDate(payout.requestedAt)}
                            </p>
                          </div>
                          <Badge className={
                            payout.status === 'completed' ? 'bg-secondary text-white' :
                            payout.status === 'failed' ? 'bg-destructive text-white' :
                            'bg-accent text-white'
                          }>
                            {payout.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{(users as any[]).length}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Videos</p>
                      <p className="text-2xl font-bold text-gray-900">{(videos as any[]).length}</p>
                    </div>
                    <Video className="w-8 h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(users as any[]).filter((u: any) => u.verificationStatus === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payout Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{(payouts as any[]).length}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
