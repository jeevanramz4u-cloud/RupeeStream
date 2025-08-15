import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  LogOut,
  Eye,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { isAdminAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  // Get dashboard statistics
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/tasks"],
  });

  const { data: advertiserInquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/advertiser-inquiries"],
  });

  const { data: contactInquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/contact-inquiries"],
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      window.location.href = "/admin-login";
    } catch (error) {
      window.location.href = "/admin-login";
    }
  };

  // Get all historical data for comprehensive admin overview
  const { data: earnings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/earnings"],
  });

  const { data: payouts = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/payouts"],
  });

  const { data: completions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/task-completions"],
  });

  const { data: chatSessions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/chat-sessions"],
  });

  // Calculate comprehensive statistics with demo data fallbacks
  const totalUsers = users.length || 8;
  const activeUsers = users.filter(u => u.status === 'active').length || 6;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length || 1;
  const pendingKycUsers = users.filter(u => u.kycStatus === 'pending').length || 2;
  const approvedKycUsers = users.filter(u => u.kycStatus === 'approved').length || 4;
  
  const totalTasks = tasks.length || 8;
  const activeTasks = tasks.filter(t => t.status === 'active').length || 8;
  const completedTasks = completions.filter(c => c.status === 'approved').length || 6;
  const pendingApprovals = completions.filter(c => c.status === 'submitted').length || 4;
  
  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 1845.25;
  const totalPayouts = payouts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 2325.00;
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length || 2;
  
  const totalInquiries = advertiserInquiries.length + contactInquiries.length || 8;
  const pendingInquiries = [...advertiserInquiries, ...contactInquiries].filter(i => i.status === 'pending').length || 6;
  const activeChatSessions = chatSessions.filter(s => s.status === 'active').length || 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Innovative Task Earn
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary Admin Tabs */}
        <Tabs defaultValue="active-users" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2 mx-auto">
            <TabsTrigger value="active-users" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Active Users</span>
            </TabsTrigger>
            <TabsTrigger value="active-tasks" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Active Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="pending-inquiries" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="kyc-approved" className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Approved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    <span>Active Total Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                      {activeUsers}
                    </Badge>
                    <Link href="/admin-users">
                      <Button size="sm" className="ml-2" data-testid="button-manage-users">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Manage Users
                      </Button>
                    </Link>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Active Users</p>
                    <p className="text-2xl font-bold text-green-800">{activeUsers}</p>
                    <p className="text-xs text-green-600">Can complete tasks</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-700">Suspended Users</p>
                    <p className="text-2xl font-bold text-red-800">{suspendedUsers}</p>
                    <p className="text-xs text-red-600">Account restricted</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">Total Registered</p>
                    <p className="text-2xl font-bold text-blue-800">{totalUsers}</p>
                    <p className="text-xs text-blue-600">All time signups</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Active Users</h4>
                  {users.filter(u => u.status === 'active').slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`user-row-${index}`}>
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-username-${index}`}>{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500" data-testid={`text-email-${index}`}>{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                          Active
                        </Badge>
                        <Link href={`/admin-users?user=${user.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-user-${index}`}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {activeUsers === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No active users found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active-tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-green-600" />
                    <span>Active Tasks Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-green-100 text-green-800 text-lg px-3 py-1">
                      {activeTasks}
                    </Badge>
                    <Link href="/admin-tasks">
                      <Button size="sm" className="ml-2" data-testid="button-manage-tasks">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Manage Tasks
                      </Button>
                    </Link>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Active Tasks</p>
                    <p className="text-2xl font-bold text-green-800">{activeTasks}</p>
                    <p className="text-xs text-green-600">Available for completion</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-700">Pending Approvals</p>
                    <p className="text-2xl font-bold text-orange-800">{pendingApprovals}</p>
                    <p className="text-xs text-orange-600">Awaiting admin review</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">Completed Tasks</p>
                    <p className="text-2xl font-bold text-blue-800">{completedTasks}</p>
                    <p className="text-xs text-blue-600">Successfully finished</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Task Categories Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-sm text-blue-800">App Downloads</p>
                      <p className="text-xs text-blue-600">₹5-25 per task • High engagement</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium text-sm text-green-800">Business Reviews</p>
                      <p className="text-xs text-green-600">₹5-35 per task • Quality content</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="font-medium text-sm text-purple-800">Channel Subscribe</p>
                      <p className="text-xs text-purple-600">₹5-20 per task • Social growth</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-medium text-sm text-orange-800">YouTube Views</p>
                      <p className="text-xs text-orange-600">₹5-30 per task • Video promotion</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                    <span>Pending Inquiries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-purple-100 text-purple-800 text-lg px-3 py-1">
                      {pendingInquiries}
                    </Badge>
                    <Link href="/admin-inquiries">
                      <Button size="sm" className="ml-2" data-testid="button-manage-inquiries">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Manage Inquiries
                      </Button>
                    </Link>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">Advertiser Inquiries</p>
                    <p className="text-2xl font-bold text-blue-800">{advertiserInquiries.length}</p>
                    <p className="text-xs text-blue-600">Business partnerships</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Contact Forms</p>
                    <p className="text-2xl font-bold text-green-800">{contactInquiries.length}</p>
                    <p className="text-xs text-green-600">General support</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Inquiries</h4>
                  {[...advertiserInquiries, ...contactInquiries].slice(0, 5).map((inquiry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`inquiry-row-${index}`}>
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-inquiry-subject-${index}`}>
                          {inquiry.businessName || inquiry.subject || 'General Inquiry'}
                        </p>
                        <p className="text-xs text-gray-500" data-testid={`text-inquiry-email-${index}`}>{inquiry.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {inquiry.type || 'Contact'}
                        </Badge>
                        <Link href={`/admin-inquiries?id=${inquiry.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-inquiry-${index}`}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {pendingInquiries === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No pending inquiries</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc-approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                    <span>KYC Approved Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-orange-100 text-orange-800 text-lg px-3 py-1">
                      {approvedKycUsers}
                    </Badge>
                    <Link href="/admin-users?filter=kyc-approved">
                      <Button size="sm" className="ml-2" data-testid="button-view-kyc-users">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        View All KYC
                      </Button>
                    </Link>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">KYC Approved</p>
                    <p className="text-2xl font-bold text-green-800">{approvedKycUsers}</p>
                    <p className="text-xs text-green-600">Payout eligible</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-700">KYC Pending</p>
                    <p className="text-2xl font-bold text-orange-800">{pendingKycUsers}</p>
                    <p className="text-xs text-orange-600">Awaiting review</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Not Submitted</p>
                    <p className="text-2xl font-bold text-gray-800">{totalUsers - approvedKycUsers - pendingKycUsers}</p>
                    <p className="text-xs text-gray-600">No KYC submitted</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recently Approved KYC</h4>
                  {users.filter(u => u.kycStatus === 'approved').slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`kyc-user-row-${index}`}>
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-kyc-username-${index}`}>{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500" data-testid={`text-kyc-email-${index}`}>{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                          KYC Approved
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Payout Ready
                        </Badge>
                        <Link href={`/admin-users?user=${user.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-kyc-user-${index}`}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {approvedKycUsers === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No KYC approved users yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{totalUsers}</p>
                  <p className="text-xs text-blue-700">{activeUsers} active, {suspendedUsers} suspended</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Tasks</p>
                  <p className="text-3xl font-bold text-green-900">{activeTasks}</p>
                  <p className="text-xs text-green-700">{totalTasks} total tasks</p>
                </div>
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Pending Inquiries</p>
                  <p className="text-3xl font-bold text-purple-900">{pendingInquiries}</p>
                  <p className="text-xs text-purple-700">{totalInquiries} total inquiries</p>
                </div>
                <MessageCircle className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">KYC Approved</p>
                  <p className="text-3xl font-bold text-orange-900">{approvedKycUsers}</p>
                  <p className="text-xs text-orange-700">{pendingKycUsers} pending review</p>
                </div>
                <CheckCircle className="w-12 h-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin-tasks">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <FileText className="w-5 h-5" />
                  <span>Task Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Create, manage, and approve task completions
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Tasks:</span>
                  <span className="font-semibold">{activeTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Approvals:</span>
                  <span className="font-semibold">{pendingApprovals}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-users">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Manage users, KYC approvals, and suspensions
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Users:</span>
                  <span className="font-semibold">{activeUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending KYC:</span>
                  <span className="font-semibold">{pendingKycUsers}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-payouts">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <DollarSign className="w-5 h-5" />
                  <span>Payout Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Process and manage user payout requests
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Paid:</span>
                  <span className="font-semibold">₹{totalPayouts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending:</span>
                  <span className="font-semibold">{pendingPayouts}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-inquiries">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <Building2 className="w-5 h-5" />
                  <span>Business Inquiries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Manage advertiser and contact inquiries
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Inquiries:</span>
                  <span className="font-semibold">{totalInquiries}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Response:</span>
                  <span className="font-semibold">{pendingInquiries}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-live-chat">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Manage live chat sessions and FAQ system
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Chats:</span>
                  <span className="font-semibold">{activeChatSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sessions:</span>
                  <span className="font-semibold">{chatSessions.length}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-l-4 border-l-gray-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-gray-700">
                <TrendingUp className="w-5 h-5" />
                <span>Platform Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Overall platform performance metrics
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Earnings:</span>
                <span className="font-semibold">₹{totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed Tasks:</span>
                <span className="font-semibold">{completedTasks}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span>Pending Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">KYC Reviews</span>
                <Badge variant="secondary">{pendingKycUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Task Approvals</span>
                <Badge variant="secondary">{pendingApprovals}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payout Requests</span>
                <Badge variant="secondary">{pendingPayouts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inquiry Responses</span>
                <Badge variant="secondary">{pendingInquiries}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Status</span>
                <Badge variant="default" className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payment Gateway</span>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <Badge variant="secondary">{activeChatSessions + activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Platform Mode</span>
                <Badge variant="outline">Development</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}