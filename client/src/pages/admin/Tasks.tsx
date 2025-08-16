import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../../components/ui/alert.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { 
  ListTodo,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Timer,
  MoreVertical,
  Download,
  Upload,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx';

interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  reward: number;
  timeLimit: number;
  status: 'active' | 'inactive' | 'pending';
  completions: number;
  approvalRate: number;
  createdDate: string;
  createdBy: string;
}

export default function AdminTasks() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Check admin access
  if (user?.role !== 'admin') {
    setLocation('/dashboard');
    return null;
  }

  // Mock tasks data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Download Amazon App',
      category: 'app_download',
      description: 'Download and install the Amazon shopping app',
      reward: 15,
      timeLimit: 20,
      status: 'active',
      completions: 1234,
      approvalRate: 95.5,
      createdDate: '2024-01-15',
      createdBy: 'Admin'
    },
    {
      id: '2',
      title: 'Review Local Restaurant',
      category: 'business_review',
      description: 'Write a genuine review for a local restaurant',
      reward: 20,
      timeLimit: 20,
      status: 'active',
      completions: 876,
      approvalRate: 88.3,
      createdDate: '2024-02-10',
      createdBy: 'Admin'
    },
    {
      id: '3',
      title: 'Subscribe to Tech Channel',
      category: 'channel_subscribe',
      description: 'Subscribe to a technology YouTube channel',
      reward: 10,
      timeLimit: 15,
      status: 'inactive',
      completions: 2345,
      approvalRate: 92.1,
      createdDate: '2024-01-20',
      createdBy: 'Admin'
    },
    {
      id: '4',
      title: 'Review Product',
      category: 'product_review',
      description: 'Write a detailed product review on e-commerce platform',
      reward: 25,
      timeLimit: 30,
      status: 'active',
      completions: 567,
      approvalRate: 79.8,
      createdDate: '2024-03-01',
      createdBy: 'Admin'
    },
    {
      id: '5',
      title: 'Like and Comment',
      category: 'comment_like',
      description: 'Like and comment on social media posts',
      reward: 5,
      timeLimit: 10,
      status: 'pending',
      completions: 0,
      approvalRate: 0,
      createdDate: '2024-03-10',
      createdBy: 'Admin'
    }
  ];

  const categories = [
    { value: 'app_download', label: 'App Downloads' },
    { value: 'business_review', label: 'Business Reviews' },
    { value: 'product_review', label: 'Product Reviews' },
    { value: 'channel_subscribe', label: 'Channel Subscribe' },
    { value: 'comment_like', label: 'Comments & Likes' },
    { value: 'youtube_video_see', label: 'YouTube Video View' }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      // API call would go here
      toast({
        title: 'Action Completed',
        description: `Task ${action} successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} task`,
        variant: 'destructive'
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTasks.length === 0) {
      toast({
        title: 'No tasks selected',
        description: 'Please select tasks to perform bulk action',
        variant: 'destructive'
      });
      return;
    }

    try {
      // API call would go here
      toast({
        title: 'Bulk Action Completed',
        description: `${selectedTasks.length} tasks ${action} successfully`
      });
      setSelectedTasks([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} tasks`,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ListTodo className="w-8 h-8 mr-3" />
            Manage Tasks
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage platform tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <ListTodo className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold">124</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completions Today</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Approval Rate</p>
                  <p className="text-2xl font-bold">92.5%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
                {selectedTasks.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedTasks.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('activated')}>
                        Activate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deactivated')}>
                        Deactivate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deleted')} className="text-red-600">
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>
              {filteredTasks.length} tasks found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(filteredTasks.map(t => t.id));
                          } else {
                            setSelectedTasks([]);
                          }
                        }}
                        checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      />
                    </th>
                    <th className="text-left p-4">Task</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Reward</th>
                    <th className="text-left p-4">Time Limit</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Completions</th>
                    <th className="text-left p-4">Approval Rate</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {getCategoryLabel(task.category)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-medium">₹{task.reward}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 text-gray-400 mr-1" />
                          <span>{task.timeLimit} min</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="p-4">
                        <p>{task.completions.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${task.approvalRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{task.approvalRate}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            {task.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleTaskAction(task.id, 'deactivated')}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleTaskAction(task.id, 'activated')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleTaskAction(task.id, 'deleted')}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Tasks
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Tasks
              </Button>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}