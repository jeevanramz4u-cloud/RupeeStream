import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Eye
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
    queryKey: ["/api/advertiser-inquiries"],
  });

  const { data: contactInquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/contact-inquiries"],
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      window.location.href = "/admin-login";
    } catch (error) {
      window.location.href = "/admin-login";
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const verifiedUsers = users.filter(u => u.verificationStatus === 'verified').length;
  const kycApprovedUsers = users.filter(u => u.kycStatus === 'approved').length;
  
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  
  const totalInquiries = advertiserInquiries.length + contactInquiries.length;
  const pendingInquiries = [...advertiserInquiries, ...contactInquiries].filter(i => i.status === 'pending').length;

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
                  <p className="text-3xl font-bold text-orange-900">{kycApprovedUsers}</p>
                  <p className="text-xs text-orange-700">{verifiedUsers} verified users</p>
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
                <p className="text-sm text-gray-600 mb-4">
                  Create, edit, and manage tasks. Review task completions and approve submissions.
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-700">
                    {activeTasks} Active Tasks
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-inquiries">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Building2 className="w-5 h-5" />
                  <span>Inquiry Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage advertiser campaigns and contact form submissions from website visitors.
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-700">
                    {pendingInquiries} Pending
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-live-chat">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage live chat sessions, FAQ system, and customer support conversations.
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-700">
                    Support Center
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Recent User Registrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(-5).reverse().map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {user.status}
                      </Badge>
                      <Badge variant={user.kycStatus === 'approved' ? 'default' : 'secondary'} className="text-xs">
                        {user.kycStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No users registered yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span>Pending Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-sm">KYC Reviews Needed</p>
                    <p className="text-xs text-gray-500">Users waiting for verification</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    {users.filter(u => u.kycStatus === 'pending').length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-medium text-sm">New Inquiries</p>
                    <p className="text-xs text-gray-500">Advertiser and contact form submissions</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    {pendingInquiries}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-sm">Task Completions</p>
                    <p className="text-xs text-gray-500">Submissions awaiting review</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    Review Needed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}