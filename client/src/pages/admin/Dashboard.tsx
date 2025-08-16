import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Alert, AlertDescription } from '../../components/ui/alert.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { 
  Users,
  DollarSign,
  ListTodo,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Activity,
  CreditCard,
  FileText,
  UserCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState('today');

  // Check admin access
  if (user?.role !== 'admin') {
    setLocation('/dashboard');
    return null;
  }

  // Mock data - replace with API calls
  const stats = {
    totalUsers: 10423,
    activeUsers: 3567,
    totalEarnings: 524300,
    pendingPayouts: 45600,
    completedTasks: 156789,
    pendingTasks: 234,
    approvalRate: 92.5,
    newUsersToday: 127
  };

  const recentActivities = [
    { type: 'user', message: 'New user registered: John Doe', time: '5 minutes ago', icon: UserCheck },
    { type: 'task', message: 'Task #12345 approved', time: '10 minutes ago', icon: CheckCircle },
    { type: 'payment', message: 'Payout of ₹5,000 processed', time: '15 minutes ago', icon: CreditCard },
    { type: 'kyc', message: 'KYC verification completed for user #567', time: '20 minutes ago', icon: FileText },
    { type: 'alert', message: 'Suspicious activity detected for user #890', time: '30 minutes ago', icon: AlertCircle }
  ];

  const pendingActions = [
    { title: '45 KYC Verifications', description: 'Pending document reviews', action: '/admin/kyc' },
    { title: '123 Task Approvals', description: 'Tasks awaiting verification', action: '/admin/tasks' },
    { title: '23 Payout Requests', description: 'Users requesting withdrawal', action: '/admin/payouts' },
    { title: '12 Support Tickets', description: 'Unresolved user inquiries', action: '/admin/support' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}. Here's what's happening on your platform.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2 mb-6">
          {['today', 'week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+{stats.newUsersToday} today</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12% vs last {timeRange}</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold">{stats.completedTasks.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Activity className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">{stats.approvalRate}% approval</span>
                  </div>
                </div>
                <ListTodo className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold">₹{stats.pendingPayouts.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-sm text-yellow-600">{stats.pendingTasks} pending</span>
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'alert' ? 'bg-red-100' :
                        activity.type === 'payment' ? 'bg-green-100' :
                        activity.type === 'task' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activity.type === 'alert' ? 'text-red-600' :
                          activity.type === 'payment' ? 'text-green-600' :
                          activity.type === 'task' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions.map((action, index) => (
                  <Link key={index} href={action.action}>
                    <a className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/tasks">
                <Button variant="outline" className="w-full">
                  <ListTodo className="w-4 h-4 mr-2" />
                  Manage Tasks
                </Button>
              </Link>
              <Link href="/admin/payouts">
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payouts
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Alert className="mt-8 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>System Status:</strong> All systems operational. Platform is running smoothly.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
}