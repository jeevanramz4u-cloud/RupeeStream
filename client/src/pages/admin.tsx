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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Users, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  EyeOff,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Shield,
  Ban,
  RotateCcw,
  LogOut,
  CreditCard,
  Building2
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
  const [kycFilter, setKycFilter] = useState<'all' | 'unpaid' | 'verification' | 'verified'>('all');
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [kycFeeFilter, setKycFeeFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showBankDetails, setShowBankDetails] = useState<Record<string, boolean>>({});

  // Filter users based on KYC status
  const getFilteredUsers = () => {
    if (!users) return [];
    const userList = users as any[];
    
    switch (kycFilter) {
      case 'unpaid':
        return userList.filter(u => !u.kycFeePaid);
      case 'verification':
        return userList.filter(u => u.kycFeePaid && u.kycStatus !== 'approved');
      case 'verified':
        return userList.filter(u => u.kycStatus === 'approved');
      default:
        return userList;
    }
  };

  // Filter users based on search term and filters
  const getSearchFilteredUsers = () => {
    if (!users) return [];
    let userList = users as any[];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      userList = userList.filter(user => {
        return (
          (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.phone && user.phone.includes(searchTerm)) ||
          (user.governmentIdNumber && user.governmentIdNumber.includes(searchTerm))
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      userList = userList.filter(user => {
        return statusFilter === "active" ? user.status !== 'suspended' : user.status === 'suspended';
      });
    }

    // Apply verification filter
    if (verificationFilter !== "all") {
      userList = userList.filter(user => user.verificationStatus === verificationFilter);
    }

    // Apply KYC fee filter
    if (kycFeeFilter !== "all") {
      userList = userList.filter(user => {
        return kycFeeFilter === "paid" ? user.kycFeePaid : !user.kycFeePaid;
      });
    }

    return userList;
  };

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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User profile deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user profile",
        variant: "destructive",
      });
    },
  });

  // Edit user profile mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: any }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    },
  });

  // Payout management mutations
  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      await apiRequest("PUT", `/api/admin/payouts/${id}`, { status, reason });
    },
    onSuccess: () => {
      toast({
        title: "Payout Updated",
        description: "Payout status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setIsPayoutDialogOpen(false);
      setSelectedPayout(null);
      setDeclineReason("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payout status",
        variant: "destructive",
      });
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async (videoData: any) => {
      await apiRequest("POST", "/api/admin/videos", videoData);
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
      await apiRequest("PUT", `/api/admin/videos/${videoId}`, updates);
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
      await apiRequest("DELETE", `/api/admin/videos/${videoId}`);
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

  // Function to extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to generate YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string | null => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const onSubmitVideo = (data: any) => {
    // Generate thumbnail URL from YouTube video
    const thumbnailUrl = getYouTubeThumbnail(data.url || "");
    
    // Prepare video data with default values
    const videoData = {
      title: data.title || "Untitled Video",
      description: data.description || "",
      url: data.url || "",
      thumbnailUrl: thumbnailUrl, // Auto-generated from YouTube
      duration: 300, // Default 5 minutes - will be auto-detected later
      category: null, // Not used anymore  
      earning: data.earning || "0.00",
      isActive: true
    };

    if (editingVideo) {
      updateVideoMutation.mutate({
        videoId: editingVideo.id,
        updates: videoData,
      });
    } else {
      createVideoMutation.mutate(videoData);
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">User Verification</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">User Profiles</span>
              <span className="sm:hidden">Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Video Management</span>
              <span className="sm:hidden">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Payouts</span>
              <span className="sm:hidden">Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">KYC Status</span>
              <span className="sm:hidden">KYC</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {(users as any[]).filter((user: any) => user.verificationStatus === 'pending').length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pending verifications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(users as any[]).filter((user: any) => user.verificationStatus === 'pending').map((user: any) => (
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
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  {formatDate(user.createdAt)}
                                </p>
                                {user.kycFeePaid && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1 py-0">
                                    Fee Paid
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-1">
                              {getStatusBadge(user.verificationStatus)}
                              {user.kycStatus && (
                                <Badge variant="secondary" className="text-xs">
                                  KYC: {user.kycStatus}
                                </Badge>
                              )}
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
                        <h3 className="font-medium text-gray-900 mb-2">KYC Information</h3>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span><strong>KYC Status:</strong></span>
                            <Badge variant={selectedUser.kycStatus === 'approved' ? 'default' : 'outline'}>
                              {selectedUser.kycStatus || 'Not started'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span><strong>Processing Fee:</strong></span>
                            {selectedUser.kycFeePaid ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid ₹99
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                Not paid
                              </Badge>
                            )}
                          </div>
                          <div className="border-t pt-2">
                            <p><strong>ID Type:</strong> {selectedUser.governmentIdType || 'Not provided'}</p>
                            <p><strong>ID Number:</strong> {selectedUser.governmentIdNumber ? `****${selectedUser.governmentIdNumber.slice(-4)}` : 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">KYC Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Government ID Front */}
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">ID Front</h4>
                            {selectedUser.governmentIdFrontUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={selectedUser.governmentIdFrontUrl} 
                                  alt="Government ID Front"
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'block';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Image not available</span>
                                </div>
                                <a 
                                  href={selectedUser.governmentIdFrontUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm block"
                                >
                                  View Full Size
                                </a>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Not uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Government ID Back */}
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">ID Back</h4>
                            {selectedUser.governmentIdBackUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={selectedUser.governmentIdBackUrl} 
                                  alt="Government ID Back"
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'block';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Image not available</span>
                                </div>
                                <a 
                                  href={selectedUser.governmentIdBackUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm block"
                                >
                                  View Full Size
                                </a>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Not uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Selfie with ID */}
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Selfie with ID</h4>
                            {selectedUser.selfieWithIdUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={selectedUser.selfieWithIdUrl} 
                                  alt="Selfie with ID"
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'block';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Image not available</span>
                                </div>
                                <a 
                                  href={selectedUser.selfieWithIdUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm block"
                                >
                                  View Full Size
                                </a>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Not uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User Profile Management</h2>
                  {searchTerm.trim() && (
                    <p className="text-sm text-gray-600 mt-1">
                      {getSearchFilteredUsers().length} user{getSearchFilteredUsers().length !== 1 ? 's' : ''} found for "{searchTerm}"
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Search users by email or name..."
                    className="w-full sm:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm.trim() && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Account Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Verification Status</Label>
                      <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Verification</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">KYC Fee Status</Label>
                      <Select value={kycFeeFilter} onValueChange={setKycFeeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All KYC Fee</SelectItem>
                          <SelectItem value="paid">Fee Paid</SelectItem>
                          <SelectItem value="unpaid">Fee Not Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter("all");
                          setVerificationFilter("all");
                          setKycFeeFilter("all");
                          setSearchTerm("");
                        }}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Grid */}
              <div className="grid grid-cols-1 gap-6">
                {(() => {
                  const filteredUsers = getSearchFilteredUsers();
                  return filteredUsers.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            {searchTerm.trim() ? `No users found matching "${searchTerm}"` : 'No users found'}
                          </p>
                          {searchTerm.trim() && (
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => setSearchTerm('')}
                            >
                              Clear Search
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredUsers.map((user: any) => (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
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
                            <Label className="text-xs font-medium text-gray-500">KYC Fee Status</Label>
                            <div className="flex items-center gap-1 mt-1">
                              {user.kycFeePaid ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600 text-xs">
                                  Unpaid
                                </Badge>
                              )}
                            </div>
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

                        {/* KYC Documents Section */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">KYC Documents</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Government ID Front */}
                            <div className="p-2 border rounded-lg">
                              <h5 className="font-medium text-xs text-gray-600 mb-2">ID Front</h5>
                              {user.governmentIdFrontUrl ? (
                                <div className="space-y-2">
                                  <img 
                                    src={user.governmentIdFrontUrl} 
                                    alt="Government ID Front"
                                    className="w-full h-20 object-cover rounded border cursor-pointer"
                                    onClick={() => window.open(user.governmentIdFrontUrl, '_blank')}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Image unavailable</span>
                                  </div>
                                  <a 
                                    href={user.governmentIdFrontUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs block"
                                  >
                                    View Full Size
                                  </a>
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">Not uploaded</span>
                                </div>
                              )}
                            </div>

                            {/* Government ID Back */}
                            <div className="p-2 border rounded-lg">
                              <h5 className="font-medium text-xs text-gray-600 mb-2">ID Back</h5>
                              {user.governmentIdBackUrl ? (
                                <div className="space-y-2">
                                  <img 
                                    src={user.governmentIdBackUrl} 
                                    alt="Government ID Back"
                                    className="w-full h-20 object-cover rounded border cursor-pointer"
                                    onClick={() => window.open(user.governmentIdBackUrl, '_blank')}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Image unavailable</span>
                                  </div>
                                  <a 
                                    href={user.governmentIdBackUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs block"
                                  >
                                    View Full Size
                                  </a>
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">Not uploaded</span>
                                </div>
                              )}
                            </div>

                            {/* Selfie with ID */}
                            <div className="p-2 border rounded-lg">
                              <h5 className="font-medium text-xs text-gray-600 mb-2">Selfie with ID</h5>
                              {user.selfieWithIdUrl ? (
                                <div className="space-y-2">
                                  <img 
                                    src={user.selfieWithIdUrl} 
                                    alt="Selfie with ID"
                                    className="w-full h-20 object-cover rounded border cursor-pointer"
                                    onClick={() => window.open(user.selfieWithIdUrl, '_blank')}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Image unavailable</span>
                                  </div>
                                  <a 
                                    href={user.selfieWithIdUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs block"
                                  >
                                    View Full Size
                                  </a>
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">Not uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* KYC Status Information */}
                          {(user.governmentIdType || user.governmentIdNumber) && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-800">
                                <strong>ID Type:</strong> {user.governmentIdType || 'Not specified'} | 
                                <strong> ID Number:</strong> {user.governmentIdNumber ? `****${user.governmentIdNumber.slice(-4)}` : 'Not provided'}
                              </p>
                            </div>
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

                          {/* Delete Profile */}
                          <Button 
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.email}'s profile? This action cannot be undone and will remove all user data including earnings, videos progress, and payout history.`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Delete Profile</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  );
                })()}
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
                      <div>
                        <Label htmlFor="title" className="text-sm">Title</Label>
                        <Input
                          {...register("title", { required: true })}
                          defaultValue={editingVideo?.title}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Textarea
                          {...register("description")}
                          defaultValue={editingVideo?.description}
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="url" className="text-sm">YouTube Video URL</Label>
                          <Input
                            {...register("url", { required: true })}
                            defaultValue={editingVideo?.url}
                            className="text-sm"
                            placeholder="https://www.youtube.com/watch?v=..."
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
                            placeholder="5.00"
                          />
                        </div>
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
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Video thumbnail */}
                              {video.thumbnailUrl && (
                                <div className="flex-shrink-0">
                                  <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                </div>
                              )}
                              
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
                                </div>
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
                <CardTitle className="flex items-center justify-between">
                  <span>Payout Requests</span>
                  <Badge variant="secondary">
                    {(payouts as any[]).length} Total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(payouts as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payout requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(payouts as any[]).map((payout: any) => {
                      const bankDetails = payout.bankDetails ? JSON.parse(payout.bankDetails) : {};
                      const isShowingBankDetails = showBankDetails[payout.id];
                      
                      return (
                        <div key={payout.id} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">₹{payout.amount}</h3>
                                <Badge className={
                                  payout.status === 'completed' ? 'bg-green-500 hover:bg-green-600' :
                                  payout.status === 'failed' || payout.status === 'declined' ? 'bg-red-500 hover:bg-red-600' :
                                  payout.status === 'processing' ? 'bg-blue-500 hover:bg-blue-600' :
                                  'bg-yellow-500 hover:bg-yellow-600'
                                }>
                                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>User ID:</strong> {payout.userId}</p>
                                <p><strong>Requested:</strong> {formatDate(payout.requestedAt)}</p>
                                {payout.processedAt && (
                                  <p><strong>Processed:</strong> {formatDate(payout.processedAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bank Details Section */}
                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Bank Details
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBankDetails(prev => ({
                                  ...prev,
                                  [payout.id]: !isShowingBankDetails
                                }))}
                              >
                                {isShowingBankDetails ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </>
                                )}
                              </Button>
                            </div>

                            {isShowingBankDetails && (
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium text-gray-700">Account Holder Name</p>
                                    <p className="text-gray-900">{bankDetails.accountHolderName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Account Number</p>
                                    <p className="text-gray-900 font-mono">{bankDetails.accountNumber || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">IFSC Code</p>
                                    <p className="text-gray-900 font-mono">{bankDetails.ifscCode || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Bank Name</p>
                                    <p className="text-gray-900">{bankDetails.bankName || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {payout.status === 'pending' && (
                            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setIsPayoutDialogOpen(true);
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  updatePayoutMutation.mutate({
                                    id: payout.id,
                                    status: 'completed'
                                  });
                                }}
                                disabled={updatePayoutMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {updatePayoutMutation.isPending ? 'Processing...' : 'Approve'}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <div className="space-y-6">
              {/* KYC Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={kycFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setKycFilter('all')}
                  >
                    All Users ({(users as any[]).length})
                  </Button>
                  <Button
                    variant={kycFilter === 'unpaid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setKycFilter('unpaid')}
                  >
                    Unpaid ({(users as any[]).filter((u: any) => !u.kycFeePaid).length})
                  </Button>
                  <Button
                    variant={kycFilter === 'verification' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setKycFilter('verification')}
                  >
                    Under Verification ({(users as any[]).filter((u: any) => u.kycFeePaid && u.kycStatus !== 'approved').length})
                  </Button>
                  <Button
                    variant={kycFilter === 'verified' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setKycFilter('verified')}
                  >
                    Verified ({(users as any[]).filter((u: any) => u.kycStatus === 'approved').length})
                  </Button>
                </div>
              </div>

              {/* KYC Fee Payment Statistics */}
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
                        <p className="text-sm font-medium text-gray-600">Fee Paid Users</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(users as any[]).filter((u: any) => u.kycFeePaid).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {(users as any[]).filter((u: any) => !u.kycFeePaid).length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{(users as any[]).filter((u: any) => u.kycFeePaid).length * 99}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KYC Fee Status List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    KYC Processing Fee Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getFilteredUsers().length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {kycFilter === 'all' ? 'No users found' : `No users found with ${kycFilter} status`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredUsers().map((user: any) => (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedUser(user);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500">
                                  Joined: {formatDate(user.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* KYC Status */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">KYC Status</p>
                              <Badge variant={user.kycStatus === 'approved' ? 'default' : 'outline'}>
                                {user.kycStatus || 'Not started'}
                              </Badge>
                            </div>
                            
                            {/* Fee Payment Status */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Fee Payment</p>
                              {user.kycFeePaid ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paid ₹99
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600">
                                  Not paid
                                </Badge>
                              )}
                            </div>
                            
                            {/* View Profile Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                // Switch to Users tab to show user details
                                setActiveTab('users');
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  firstName: formData.get('firstName'),
                  lastName: formData.get('lastName'),
                  email: formData.get('email'),
                  phoneNumber: formData.get('phoneNumber'),
                  dateOfBirth: formData.get('dateOfBirth'),
                  address: formData.get('address'),
                  city: formData.get('city'),
                  state: formData.get('state'),
                  pinCode: formData.get('pinCode'),
                  accountHolderName: formData.get('accountHolderName'),
                  accountNumber: formData.get('accountNumber'),
                  ifscCode: formData.get('ifscCode'),
                  bankName: formData.get('bankName'),
                  governmentIdType: formData.get('governmentIdType'),
                  governmentIdNumber: formData.get('governmentIdNumber'),
                };
                editUserMutation.mutate({ userId: editingUser.id, userData });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={editingUser.firstName || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={editingUser.lastName || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingUser.email || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={editingUser.phoneNumber || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={editingUser.dateOfBirth || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="governmentIdType">Government ID Type</Label>
                  <Select name="governmentIdType" defaultValue={editingUser.governmentIdType || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="pan">PAN Card</SelectItem>
                      <SelectItem value="voter">Voter ID</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="governmentIdNumber">Government ID Number</Label>
                <Input
                  id="governmentIdNumber"
                  name="governmentIdNumber"
                  defaultValue={editingUser.governmentIdNumber || ''}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={editingUser.address || ''}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingUser.city || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editingUser.state || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    defaultValue={editingUser.pinCode || ''}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-4">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input
                      id="accountHolderName"
                      name="accountHolderName"
                      defaultValue={editingUser.accountHolderName || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      defaultValue={editingUser.accountNumber || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      name="ifscCode"
                      defaultValue={editingUser.ifscCode || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      defaultValue={editingUser.bankName || ''}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editUserMutation.isPending}
                >
                  {editUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Decline Dialog */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Payout Request</DialogTitle>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Payout Details</h3>
                <p className="text-sm text-red-700">
                  <strong>Amount:</strong> ₹{selectedPayout.amount}
                </p>
                <p className="text-sm text-red-700">
                  <strong>User ID:</strong> {selectedPayout.userId}
                </p>
                <p className="text-sm text-red-700">
                  <strong>Requested:</strong> {formatDate(selectedPayout.requestedAt)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="declineReason">Reason for Decline (Required)</Label>
                <Textarea
                  id="declineReason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please provide a clear reason for declining this payout request..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPayoutDialogOpen(false);
                setSelectedPayout(null);
                setDeclineReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!declineReason.trim()) {
                  toast({
                    title: "Reason Required",
                    description: "Please provide a reason for declining the payout.",
                    variant: "destructive",
                  });
                  return;
                }
                updatePayoutMutation.mutate({
                  id: selectedPayout.id,
                  status: 'declined',
                  reason: declineReason
                });
              }}
              disabled={updatePayoutMutation.isPending || !declineReason.trim()}
            >
              {updatePayoutMutation.isPending ? 'Processing...' : 'Decline Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
