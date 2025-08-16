import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  TrendingUp, 
  ListTodo, 
  Users, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role === 'admin') {
      // Redirect admins to their dashboard
      setLocation('/admin/dashboard');
    }
  }, [user, setLocation]);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/users/dashboard-stats'],
    enabled: !!user,
    initialData: {
      totalEarnings: 0,
      todayEarnings: 0,
      completedTasks: 0,
      pendingTasks: 0,
      referralCount: 0,
      currentBalance: user?.balance || 0
    }
  });

  // Fetch recent tasks
  const { data: recentTasks } = useQuery({
    queryKey: ['/api/tasks/recent'],
    enabled: !!user,
    initialData: []
  });

  if (!user || user.role === 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Current Balance',
      value: `₹${stats?.currentBalance || 0}`,
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Earnings',
      value: `₹${stats?.totalEarnings || 0}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed Tasks',
      value: stats?.completedTasks || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Referrals',
      value: stats?.referralCount || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const getKYCStatusBadge = () => {
    switch (user.kycStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            KYC Verified
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            KYC Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            KYC Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            KYC Pending
          </span>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your earnings and activities
          </p>
        </div>

        {/* KYC Alert */}
        {user.kycStatus !== 'verified' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Complete KYC Verification</p>
                  <p className="text-sm text-gray-600">
                    Verify your account to withdraw earnings. One-time fee: ₹99
                  </p>
                </div>
              </div>
              <Link href="/kyc">
                <Button variant="default" size="sm">
                  Complete KYC
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these actions</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/tasks">
                  <Button className="w-full" variant="outline">
                    <ListTodo className="w-4 h-4 mr-2" />
                    Browse Tasks
                  </Button>
                </Link>
                <Link href="/earnings">
                  <Button className="w-full" variant="outline">
                    <Wallet className="w-4 h-4 mr-2" />
                    View Earnings
                  </Button>
                </Link>
                <Link href="/referrals">
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Friends
                  </Button>
                </Link>
                <Link href="/withdrawal">
                  <Button className="w-full" variant="outline">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest task completions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTasks && recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            task.status === 'approved' ? 'bg-green-50' :
                            task.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
                          }`}>
                            {task.status === 'approved' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : task.status === 'pending' ? (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-500">{task.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{task.reward}</p>
                          <p className="text-xs text-gray-500">{task.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No tasks completed yet</p>
                    <Link href="/tasks">
                      <Button size="sm" className="mt-4">
                        Start Earning
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium">
                    {user.status === 'active' ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Suspended</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">KYC Status</span>
                  {getKYCStatusBadge()}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Referral Code</span>
                  <span className="text-sm font-medium font-mono">
                    {user.id?.substring(0, 8).toUpperCase() || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="text-sm font-medium">₹{stats?.todayEarnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium">₹{stats?.totalEarnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium">₹{stats?.pendingTasks || 0}</span>
                </div>
                <div className="pt-3 border-t">
                  <Link href="/earnings">
                    <Button className="w-full" size="sm">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}