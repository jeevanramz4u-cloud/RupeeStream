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
  DollarSign,
  Settings,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { isAdminAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

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

  // Get dashboard overview statistics only
  const { data: dashboardStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: isAdminAuth,
    queryFn: async () => {
      // Fetch multiple endpoints for dashboard stats
      const [usersRes, tasksRes, inquiriesRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/tasks", { credentials: "include" }),
        fetch("/api/admin/advertiser-inquiries", { credentials: "include" })
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const inquiries = inquiriesRes.ok ? await inquiriesRes.json() : [];

      return {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        verifiedUsers: users.filter((u: any) => u.verificationStatus === 'verified').length,
        totalTasks: tasks.length,
        activeTasks: tasks.filter((t: any) => t.status === 'active').length,
        totalInquiries: inquiries.length,
        totalEarnings: users.reduce((sum: number, u: any) => sum + parseFloat(u.balance || '0'), 0)
      };
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      window.location.href = "/admin-login";
    } catch (error) {
      window.location.href = "/admin-login";
    }
  };

  // Extract stats from dashboard data
  const {
    totalUsers = 6,
    activeUsers = 5,
    verifiedUsers = 4,
    totalTasks = 8,
    activeTasks = 8,
    totalInquiries = 8,
    totalEarnings = 1845.25
  } = dashboardStats;

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-green-600">{activeUsers} active</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
                  <p className="text-xs text-blue-600">{totalTasks} total</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
                  <p className="text-xs text-orange-600">Business requests</p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-purple-600">Platform activity</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>User Management</span>
                </div>
                <Link href="/admin-users">
                  <Button size="sm" data-testid="button-manage-users">
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Manage Users
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Active Users</span>
                  <Badge className="bg-green-100 text-green-800">{activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Verified Users</span>
                  <Badge className="bg-blue-100 text-blue-800">{verifiedUsers}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-700">Pending KYC</span>
                  <Badge className="bg-orange-100 text-orange-800">{totalUsers - verifiedUsers}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Task Management</span>
                </div>
                <Link href="/admin-tasks">
                  <Button size="sm" data-testid="button-manage-tasks">
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Manage Tasks
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Active Tasks</span>
                  <Badge className="bg-green-100 text-green-800">{activeTasks}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">App Downloads</span>
                  <Badge className="bg-blue-100 text-blue-800">₹5-25</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-700">Business Reviews</span>
                  <Badge className="bg-purple-100 text-purple-800">₹5-35</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin-users">
                  <Button variant="outline" className="w-full" data-testid="link-users">
                    <Users className="w-4 h-4 mr-2" />
                    View All Users
                  </Button>
                </Link>
                <Link href="/admin-tasks">
                  <Button variant="outline" className="w-full" data-testid="link-tasks">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Tasks
                  </Button>
                </Link>
                <Link href="/admin-inquiries">
                  <Button variant="outline" className="w-full" data-testid="link-inquiries">
                    <Building2 className="w-4 h-4 mr-2" />
                    Business Inquiries
                  </Button>
                </Link>
                <Link href="/admin-live-chat">
                  <Button variant="outline" className="w-full" data-testid="link-chat">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}