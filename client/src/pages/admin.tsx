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
  User,
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
  Building2,
  Coins,
  ExternalLink,
  Smartphone,
  Star,
  Youtube,
  MessageCircle,
  ThumbsUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";


// Task Management Component
const TaskManagementContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isCompletionsDialogOpen, setIsCompletionsDialogOpen] = useState(false);
  const [selectedTaskCompletions, setSelectedTaskCompletions] = useState<any[]>([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "app_download",
    reward: "",
    timeLimit: "",
    maxCompletions: "",
    requirements: "",
    verificationMethod: "manual"
  });

  const taskCategories = {
    app_download: { 
      name: "App Downloads", 
      icon: Smartphone,
      description: "Download and install mobile apps",
      rewardRange: "₹15-25"
    },
    business_review: { 
      name: "Business Reviews", 
      icon: Star,
      description: "Write reviews for businesses on Google, Zomato etc",
      rewardRange: "₹30-35"
    },
    product_review: { 
      name: "Product Reviews", 
      icon: FileText,
      description: "Review products on e-commerce platforms",
      rewardRange: "₹25-40"
    },
    channel_subscribe: { 
      name: "Channel Subscribe", 
      icon: Youtube,
      description: "Subscribe to YouTube channels and social media",
      rewardRange: "₹15-20"
    },
    comment_like: { 
      name: "Comments & Likes", 
      icon: MessageCircle,
      description: "Like posts, comment on content, engage with social media",
      rewardRange: "₹10-15"
    }
  };

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/admin/tasks"],
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["/api/admin/task-completions"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/admin/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Created", description: "New task has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setIsCreateDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        category: "app_download",
        reward: "",
        timeLimit: "",
        maxCompletions: "",
        requirements: "",
        verificationMethod: "manual"
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create task",
        variant: "destructive" 
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      await apiRequest("PUT", `/api/admin/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Task Updated", description: "Task has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setEditingTask(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: "Failed to update task",
        variant: "destructive" 
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/admin/tasks/${taskId}`);
    },
    onSuccess: () => {
      toast({ title: "Task Deleted", description: "Task has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete task",
        variant: "destructive" 
      });
    },
  });

  const approveCompletionMutation = useMutation({
    mutationFn: async ({ completionId, status }: { completionId: string; status: 'approved' | 'rejected' }) => {
      await apiRequest("PUT", `/api/admin/task-completions/${completionId}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Task completion status has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/task-completions"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: "Failed to update completion status",
        variant: "destructive" 
      });
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.reward) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    createTaskMutation.mutate({
      ...newTask,
      reward: parseFloat(newTask.reward),
      timeLimit: parseInt(newTask.timeLimit) || 60,
      maxCompletions: parseInt(newTask.maxCompletions) || 100,
      isActive: true
    });
  };

  const pendingCompletions = completions.filter((c: any) => c.status === 'pending');
  const getTaskCompletions = (taskId: string) => completions.filter((c: any) => c.taskId === taskId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Task Management Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Task Management</h2>
          <p className="text-sm text-gray-600 mt-1">Create and manage tasks across all categories</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          size="sm"
          className="text-xs sm:text-sm"
          data-testid="button-create-task"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Create New Task</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Task Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(taskCategories).map(([key, category]) => {
          const Icon = category.icon;
          const categoryTasks = tasks.filter((task: any) => task.category === key);
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-600">{category.rewardRange}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {categoryTasks.filter((t: any) => t.isActive).length} active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Tasks List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {tasks.length} Total
            </Badge>
            <Badge variant="outline">
              {tasks.filter((t: any) => t.isActive).length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks created yet</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Create Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task: any) => {
                const category = taskCategories[task.category as keyof typeof taskCategories];
                const Icon = category?.icon || FileText;
                const taskCompletions = getTaskCompletions(task.id);
                const pendingCount = taskCompletions.filter((c: any) => c.status === 'pending').length;
                
                return (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{task.title}</h3>
                            <Badge variant={task.isActive ? "default" : "secondary"} className="text-xs">
                              {task.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Coins className="w-3 h-3 mr-1" />
                              ₹{task.reward}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.timeLimit}min
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {taskCompletions.length}/{task.maxCompletions}
                            </span>
                            {pendingCount > 0 && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {pendingCount} pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTask(task)}
                          data-testid={`button-edit-task-${task.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTaskCompletions(taskCompletions);
                            setIsCompletionsDialogOpen(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                          data-testid={`button-view-completions-${task.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this task?')) {
                              deleteTaskMutation.mutate(task.id);
                            }
                          }}
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {pendingCompletions.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              Pending Approvals ({pendingCompletions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCompletions.slice(0, 5).map((completion: any) => {
                const task = tasks.find((t: any) => t.id === completion.taskId);
                
                return (
                  <div key={completion.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{task?.title || 'Unknown Task'}</p>
                        <p className="text-xs text-gray-600">User: {completion.userId} • Submitted: {new Date(completion.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => approveCompletionMutation.mutate({ completionId: completion.id, status: 'approved' })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-approve-completion-${completion.id}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => approveCompletionMutation.mutate({ completionId: completion.id, status: 'rejected' })}
                          data-testid={`button-reject-completion-${completion.id}`}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Task Category</Label>
              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                <SelectTrigger data-testid="select-task-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(taskCategories).map(([key, category]) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">({category.rewardRange})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Task Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                data-testid="input-task-title"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe what users need to do"
                className="min-h-[80px]"
                data-testid="textarea-task-description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Reward (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                  placeholder="15.00"
                  data-testid="input-task-reward"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={newTask.timeLimit}
                  onChange={(e) => setNewTask({ ...newTask, timeLimit: e.target.value })}
                  placeholder="60"
                  data-testid="input-task-time-limit"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Max Completions</Label>
                <Input
                  type="number"
                  value={newTask.maxCompletions}
                  onChange={(e) => setNewTask({ ...newTask, maxCompletions: e.target.value })}
                  placeholder="100"
                  data-testid="input-task-max-completions"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Requirements & Instructions</Label>
              <Textarea
                value={newTask.requirements}
                onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                placeholder="Detailed instructions for task completion"
                className="min-h-[100px]"
                data-testid="textarea-task-requirements"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Verification Method</Label>
              <Select value={newTask.verificationMethod} onValueChange={(value) => setNewTask({ ...newTask, verificationMethod: value })}>
                <SelectTrigger data-testid="select-verification-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Review</SelectItem>
                  <SelectItem value="screenshot">Screenshot Required</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={createTaskMutation.isPending}
              data-testid="button-submit-create-task"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Completions Dialog */}
      <Dialog open={isCompletionsDialogOpen} onOpenChange={setIsCompletionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Completions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTaskCompletions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No completions for this task yet</p>
            ) : (
              selectedTaskCompletions.map((completion: any) => (
                <div key={completion.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">User: {completion.userId}</p>
                      <p className="text-sm text-gray-600">Submitted: {new Date(completion.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={
                      completion.status === 'approved' ? 'bg-green-500' :
                      completion.status === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }>
                      {completion.status}
                    </Badge>
                  </div>
                  {completion.proof && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Proof:</p>
                      <p className="text-sm text-gray-600">{completion.proof}</p>
                    </div>
                  )}
                  {completion.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => approveCompletionMutation.mutate({ completionId: completion.id, status: 'approved' })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => approveCompletionMutation.mutate({ completionId: completion.id, status: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Task Title</Label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reward (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingTask.reward}
                    onChange={(e) => setEditingTask({ ...editingTask, reward: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editingTask.isActive ? "active" : "inactive"} onValueChange={(value) => setEditingTask({ ...editingTask, isActive: value === "active" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => updateTaskMutation.mutate({ taskId: editingTask.id, updates: editingTask })}
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default function Admin() {
  const { adminUser, isLoading: isAdminLoading, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
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
  const [showUserPasswords, setShowUserPasswords] = useState<Record<string, boolean>>({});
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'kyc' | 'reactivation'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState<string>('');

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

  // Show loading spinner while checking authentication
  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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



  const { data: payouts = [] } = useQuery({
    queryKey: ["/api/admin/payouts"],
    enabled: isAuthenticated,
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated,
  });

  const { data: paymentHistory = [] } = useQuery({
    queryKey: ["/api/admin/payment-history"],
    enabled: isAuthenticated,
  });

  // Type cast for payment history data
  const paymentHistoryData = paymentHistory as any[];

  // User profile query (only fetch when needed)  
  const { data: userProfile, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ["user-profile", selectedUserProfile?.id],
    queryFn: async () => {
      if (!selectedUserProfile?.id) {
        throw new Error('No user ID provided');
      }
      
      try {
        const response = await fetch(`/api/admin/users/${selectedUserProfile.id}/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Profile API response:', data);
        return data;
      } catch (error) {
        console.error('Profile API error:', error);
        throw error;
      }
    },
    enabled: !!selectedUserProfile?.id,
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



  const processReferralsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/process-pending-referrals");
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Processed ${data.processed || 0} referral bonuses successfully`,
      });
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process referral bonuses",
        variant: "destructive",
      });
    },
  });

  // Function to open user profile dialog
  const openUserProfile = (user: any) => {
    console.log('Opening user profile for:', user);
    setSelectedUserProfile(user);
    setUserProfileDialogOpen(true);
    setShowSensitiveInfo(true); // Show all sensitive info by default for admins
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

  const getStatusBadge = (user: any) => {
    // Check if user has completed KYC (paid fee + approved) - handle both field name formats
    const kycFeePaid = user.kycFeePaid || user.kyc_fee_paid;
    const kycStatus = user.kycStatus || user.kyc_status;
    const verificationStatus = user.verificationStatus || user.verification_status;
    
    // Priority 1: KYC Completed (fee paid + approved status)
    if (kycFeePaid && kycStatus === 'approved') {
      return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />KYC Completed</Badge>;
    }
    
    // Priority 2: KYC Fee Paid but pending approval
    if (kycFeePaid) {
      return <Badge className="bg-blue-600 text-white"><Clock className="w-3 h-3 mr-1" />KYC Fee Paid</Badge>;
    }
    
    // Priority 3: Standard verification status
    switch (verificationStatus) {
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
              <span className="text-lg sm:text-xl font-bold text-gray-900">Innovative Task Earn Admin</span>
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
                      // Force page reload to clear auth state
                      window.location.href = "/admin-login";
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
          <p className="text-sm sm:text-base text-gray-600">Manage users, tasks, and platform operations.</p>
          
          {/* Quick Actions Section removed as requested by user */}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">User Verification</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">User Profiles</span>
              <span className="sm:hidden">Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Task Management</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Payouts</span>
              <span className="sm:hidden">Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">KYC Status</span>
              <span className="sm:hidden">KYC</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Payment History</span>
              <span className="sm:hidden">Payments</span>
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
                  {(users as any[]).filter((user: any) => {
                    const kycFeePaid = user.kycFeePaid || user.kyc_fee_paid;
                    const kycStatus = user.kycStatus || user.kyc_status;
                    const verificationStatus = user.verificationStatus || user.verification_status;
                    // Only show truly pending users (no fee paid, not completed)
                    return verificationStatus === 'pending' && !kycFeePaid && kycStatus !== 'approved';
                  }).length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pending verifications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(users as any[]).filter((user: any) => {
                        const kycFeePaid = user.kycFeePaid || user.kyc_fee_paid;
                        const kycStatus = user.kycStatus || user.kyc_status;
                        const verificationStatus = user.verificationStatus || user.verification_status;
                        // Only show truly pending users (no fee paid, not completed)
                        return verificationStatus === 'pending' && !kycFeePaid && kycStatus !== 'approved';
                      }).map((user: any) => (
                        <div 
                          key={user.id}
                          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md group ${
                            selectedUser?.id === user.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-primary/30'
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate group-hover:text-primary transition-colors">
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
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to view details or click "View Profile" for full profile
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-1">
                              {getStatusBadge(user)}
                              {user.kycStatus && (
                                <Badge variant="secondary" className="text-xs">
                                  KYC: {user.kycStatus}
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUserProfile(user);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-6"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
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
                            {getStatusBadge(selectedUser)}
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

                      {/* Payment History */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payment History
                        </h3>
                        <div className="space-y-2">
                          {paymentHistoryData
                            .filter((payment: any) => payment.userId === selectedUser.id)
                            .map((payment: any) => (
                              <div 
                                key={payment.id} 
                                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    payment.status === 'completed' ? 'bg-green-500' : 
                                    payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {payment.type === 'kyc' ? 'KYC Processing Fee' : 'Account Reactivation Fee'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Order: {payment.orderId || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-green-600">₹{payment.amount}</p>
                                  <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                    {payment.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          {paymentHistoryData.filter((payment: any) => payment.userId === selectedUser.id).length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm">No payment history found</p>
                            </div>
                          )}
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
                            {selectedUser.govIdFrontUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={selectedUser.govIdFrontUrl} 
                                  alt="Government ID Front"
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                      nextSibling.style.display = 'block';
                                    }
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Image not available</span>
                                </div>
                                <a 
                                  href={selectedUser.govIdFrontUrl}
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
                            {selectedUser.govIdBackUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={selectedUser.govIdBackUrl} 
                                  alt="Government ID Back"
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                      nextSibling.style.display = 'block';
                                    }
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">Image not available</span>
                                </div>
                                <a 
                                  href={selectedUser.govIdBackUrl}
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
                                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                      nextSibling.style.display = 'block';
                                    }
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

                      {/* Only show approve/reject for users who haven't completed KYC and haven't paid fee */}
                      {(() => {
                        const kycFeePaid = selectedUser.kycFeePaid || selectedUser.kyc_fee_paid;
                        const kycStatus = selectedUser.kycStatus || selectedUser.kyc_status;
                        const verificationStatus = selectedUser.verificationStatus || selectedUser.verification_status;
                        // Don't show approve/reject if user paid fee or already completed KYC
                        return verificationStatus === 'pending' && !kycFeePaid && kycStatus !== 'approved';
                      })() && (
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
                      
                      {/* Show KYC completion status for completed users */}
                      {(() => {
                        const kycFeePaid = selectedUser.kycFeePaid || selectedUser.kyc_fee_paid;
                        const kycStatus = selectedUser.kycStatus || selectedUser.kyc_status;
                        return kycFeePaid && kycStatus === 'approved';
                      })() && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center text-green-800">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="font-semibold">KYC Verification Completed</span>
                          </div>
                          <p className="text-green-700 text-sm mt-1">
                            User has completed KYC verification with ₹99 processing fee payment. No further action required.
                          </p>
                        </div>
                      )}
                      
                      {/* Show fee paid status for users who paid but waiting for approval */}
                      {(() => {
                        const kycFeePaid = selectedUser.kycFeePaid || selectedUser.kyc_fee_paid;
                        const kycStatus = selectedUser.kycStatus || selectedUser.kyc_status;
                        return kycFeePaid && kycStatus !== 'approved';
                      })() && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center text-blue-800">
                            <DollarSign className="w-5 h-5 mr-2" />
                            <span className="font-semibold">KYC Processing Fee Paid</span>
                          </div>
                          <p className="text-blue-700 text-sm mt-1">
                            User has paid the ₹99 KYC processing fee. Payment verification complete - no manual approval needed.
                          </p>
                        </div>
                      )}
                      
                      {/* Admin Actions Section - Always Available */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                        <h3 className="font-medium text-red-900 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Actions
                        </h3>
                        <div className="space-y-3">
                          {/* Account Reactivation */}
                          {selectedUser.status === 'suspended' ? (
                            <Button
                              onClick={() => suspendUserMutation.mutate({
                                userId: selectedUser.id,
                                status: 'active'
                              })}
                              disabled={suspendUserMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {suspendUserMutation.isPending ? 'Reactivating...' : 'Reactivate Account'}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => suspendUserMutation.mutate({
                                userId: selectedUser.id,
                                status: 'suspended'
                              })}
                              disabled={suspendUserMutation.isPending}
                              variant="outline"
                              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend Account'}
                            </Button>
                          )}
                          
                          {/* Delete Profile */}
                          <Button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete ${selectedUser.firstName} ${selectedUser.lastName}'s profile? This action cannot be undone.`)) {
                                deleteUserMutation.mutate(selectedUser.id);
                                setSelectedUser(null); // Clear selection after deletion
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Profile Permanently'}
                          </Button>
                        </div>
                        <p className="text-xs text-red-600 mt-3">
                          ⚠️ Use these actions carefully. Account suspension affects user access, and profile deletion is permanent.
                        </p>
                      </div>
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
                  <div className="mt-1">
                    {searchTerm.trim() ? (
                      <p className="text-sm text-gray-600">
                        {getSearchFilteredUsers().length} user{getSearchFilteredUsers().length !== 1 ? 's' : ''} found for "{searchTerm}"
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Total Users: {Array.isArray(users) ? users.length : 0}
                      </p>
                    )}
                  </div>
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



              {/* Users List Layout */}
              <div className="space-y-2">
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
                      <Card 
                        key={user.id} 
                        className="hover:shadow-md transition-all duration-200 hover:border-blue-300 border border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            {/* User Info Section */}
                            <div className="flex items-center space-x-4">
                              {/* Avatar */}
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  user.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                              </div>
                              
                              {/* Basic Info */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                                  
                                  {/* Status Badges */}
                                  <div className="flex space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      user.status === 'suspended' 
                                        ? 'bg-red-100 text-red-700' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                    </span>
                                    
                                    {user.kycFeePaid && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        KYC Paid
                                      </span>
                                    )}
                                    
                                    {user.verificationStatus === 'verified' && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                                
                                {/* Quick Stats */}
                                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Earnings: ₹{user.totalEarnings || 0}</span>
                                  <span>Videos: {user.videosWatched || 0}</span>
                                  <span>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Button */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUserProfile(user)}
                                className="text-blue-600 hover:bg-blue-50 border-blue-300"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  );
                })()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagementContent />
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

          {/* Payment History Tab */}
          <TabsContent value="payments">
            <div className="space-y-6">
              {/* Payment History Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment History Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800">
                        ₹{paymentHistoryData.filter((p: any) => p.type === 'kyc' && p.status === 'completed').length * 99}
                      </h3>
                      <p className="text-sm text-blue-600">Total KYC Revenue</p>
                      <p className="text-xs text-blue-500">
                        {paymentHistoryData.filter((p: any) => p.type === 'kyc' && p.status === 'completed').length} payments
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800">
                        ₹{paymentHistoryData.filter((p: any) => p.type === 'reactivation' && p.status === 'completed').length * 49}
                      </h3>
                      <p className="text-sm text-green-600">Total Reactivation Revenue</p>
                      <p className="text-xs text-green-500">
                        {paymentHistoryData.filter((p: any) => p.type === 'reactivation' && p.status === 'completed').length} payments
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800">
                        ₹{paymentHistoryData.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + Number(p.amount), 0)}
                      </h3>
                      <p className="text-sm text-purple-600">Total Revenue</p>
                      <p className="text-xs text-purple-500">
                        {paymentHistoryData.filter((p: any) => p.status === 'completed').length} total payments
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Payment Transactions
                  </CardTitle>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <Input
                        placeholder="Search by user email, order ID, or user ID..."
                        value={paymentSearchTerm}
                        onChange={(e) => setPaymentSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Payment Type Filter */}
                    <div className="flex gap-2">
                      <Button
                        variant={paymentFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentFilter('all')}
                      >
                        All Types
                      </Button>
                      <Button
                        variant={paymentFilter === 'kyc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentFilter('kyc')}
                      >
                        KYC (₹99)
                      </Button>
                      <Button
                        variant={paymentFilter === 'reactivation' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentFilter('reactivation')}
                      >
                        Reactivation (₹49)
                      </Button>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex gap-2">
                      <Button
                        variant={paymentStatusFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter('all')}
                      >
                        All Status
                      </Button>
                      <Button
                        variant={paymentStatusFilter === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter('completed')}
                      >
                        Completed
                      </Button>
                      <Button
                        variant={paymentStatusFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter('pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={paymentStatusFilter === 'failed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter('failed')}
                      >
                        Failed
                      </Button>
                    </div>
                    
                    {/* Date Filter */}
                    <div>
                      <Input
                        type="date"
                        value={paymentDateFilter}
                        onChange={(e) => setPaymentDateFilter(e.target.value)}
                        className="w-auto"
                        placeholder="Filter by date"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {paymentHistoryData.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No payment history found</p>
                      <p className="text-xs text-gray-400 mt-2">
                        KYC and reactivation payments will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Apply filters to payment data
                        let filteredPayments = paymentHistoryData.filter((payment: any) => {
                          // Type filter
                          if (paymentFilter !== 'all' && payment.type !== paymentFilter) {
                            return false;
                          }
                          
                          // Status filter
                          if (paymentStatusFilter !== 'all' && payment.status !== paymentStatusFilter) {
                            return false;
                          }
                          
                          // Date filter
                          if (paymentDateFilter && payment.createdAt) {
                            const paymentDate = new Date(payment.createdAt).toDateString();
                            const filterDate = new Date(paymentDateFilter).toDateString();
                            if (paymentDate !== filterDate) {
                              return false;
                            }
                          }
                          
                          // Search filter
                          if (paymentSearchTerm) {
                            const searchLower = paymentSearchTerm.toLowerCase();
                            const userEmail = (payment.userEmail || '').toLowerCase();
                            const userName = (payment.userName || '').toLowerCase();
                            const orderId = (payment.orderId || '').toLowerCase();
                            const userId = (payment.userId || '').toLowerCase();
                            
                            if (!userEmail.includes(searchLower) && 
                                !userName.includes(searchLower) && 
                                !orderId.includes(searchLower) && 
                                !userId.includes(searchLower)) {
                              return false;
                            }
                          }
                          
                          return true;
                        });
                        
                        return (
                          <>
                            {/* Filter Results Summary */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">
                                Showing {filteredPayments.length} of {paymentHistoryData.length} payments
                                {paymentFilter !== 'all' && (
                                  <span className="ml-2 text-blue-600">• {paymentFilter.toUpperCase()} only</span>
                                )}
                                {paymentStatusFilter !== 'all' && (
                                  <span className="ml-2 text-green-600">• {paymentStatusFilter.toUpperCase()} status</span>
                                )}
                                {paymentDateFilter && (
                                  <span className="ml-2 text-purple-600">• {new Date(paymentDateFilter).toLocaleDateString()}</span>
                                )}
                                {paymentSearchTerm && (
                                  <span className="ml-2 text-orange-600">• "{paymentSearchTerm}"</span>
                                )}
                              </div>
                              
                              {(paymentFilter !== 'all' || paymentStatusFilter !== 'all' || paymentDateFilter || paymentSearchTerm) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPaymentFilter('all');
                                    setPaymentStatusFilter('all');
                                    setPaymentDateFilter('');
                                    setPaymentSearchTerm('');
                                  }}
                                >
                                  Clear Filters
                                </Button>
                              )}
                            </div>
                            
                            {filteredPayments.length === 0 ? (
                              <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No payments match your filters</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Try adjusting your filter criteria
                                </p>
                              </div>
                            ) : (
                              filteredPayments.map((payment: any) => (
                        <div 
                          key={payment.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                payment.status === 'completed' ? 'bg-green-500' : 
                                payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {payment.userName || payment.userEmail || 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-600">{payment.userEmail || 'No email'}</p>
                                <p className="text-xs text-gray-500">
                                  Order ID: {payment.orderId || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  User ID: {payment.userId}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Payment Type */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Type</p>
                              <Badge variant={payment.type === 'kyc' ? 'default' : 'secondary'}>
                                {payment.type === 'kyc' ? 'KYC Fee' : 'Reactivation'}
                              </Badge>
                            </div>
                            
                            {/* Payment Amount */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Amount</p>
                              <p className="font-semibold text-green-600">₹{payment.amount}</p>
                            </div>
                            
                            {/* Payment Status */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <Badge variant={
                                payment.status === 'completed' ? 'default' : 
                                payment.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                            
                            {/* Payment Date */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Date</p>
                              <p className="text-xs text-gray-700">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                              ))
                            )}
                          </>
                        );
                      })()}
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

      {/* User Profile Dialog with Referral History */}
      <Dialog open={userProfileDialogOpen} onOpenChange={setUserProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Profile Details
              {selectedUserProfile && (
                <Badge variant={selectedUserProfile.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                  {selectedUserProfile.verificationStatus}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="ml-2 text-gray-600">Loading profile...</p>
            </div>
          ) : userProfile ? (
            <div className="space-y-6">
              {/* Basic User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-sm font-medium">{userProfile.user.firstName} {userProfile.user.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm font-medium">{userProfile.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                      <p className="text-sm font-medium">{userProfile.user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Current Balance</Label>
                      <p className="text-sm font-medium text-green-600">₹{userProfile.user.balance || '0.00'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Password Hash</Label>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono bg-gray-100 p-2 rounded border max-w-md overflow-x-auto">
                            {showUserPasswords[userProfile.user.id] 
                              ? (userProfile.user.password || 'Not available') 
                              : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                            }
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUserPasswords(prev => ({
                              ...prev,
                              [userProfile.user.id]: !prev[userProfile.user.id]
                            }))}
                            className="h-8 px-2"
                          >
                            {showUserPasswords[userProfile.user.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Note: This is the bcrypt-hashed password. Original plain text cannot be retrieved due to security encryption.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Total Earnings</Label>
                      <p className="text-sm font-medium text-blue-600">₹{userProfile.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">KYC Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={userProfile.user.kycStatus === 'approved' ? 'default' : 'secondary'}>
                          {userProfile.user.kycStatus}
                        </Badge>
                        {userProfile.user.kycFeePaid && (
                          <Badge className="bg-green-100 text-green-800">Fee Paid</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <p className="text-sm font-medium">{userProfile.user.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Gender</Label>
                      <p className="text-sm font-medium">{userProfile.user.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="text-sm font-medium">{userProfile.user.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">City</Label>
                      <p className="text-sm font-medium">{userProfile.user.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">State</Label>
                      <p className="text-sm font-medium">{userProfile.user.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pincode</Label>
                      <p className="text-sm font-medium">{userProfile.user.pincode || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Banking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Account Holder Name</Label>
                      <p className="text-sm font-medium">{userProfile.user.accountHolderName || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Account Number</Label>
                      <p className="text-sm font-medium">{userProfile.user.accountNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">IFSC Code</Label>
                      <p className="text-sm font-medium">{userProfile.user.ifscCode || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bank Name</Label>
                      <p className="text-sm font-medium">{userProfile.user.bankName || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC Documents & Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Government ID Information */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Government ID Details</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">ID Type</Label>
                        <p className="text-sm font-medium">{userProfile.user.governmentIdType || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">ID Number</Label>
                        <p className="text-sm font-medium">{userProfile.user.governmentIdNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Images */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Government ID Front */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-3">Government ID - Front</h5>
                        {userProfile.user.govIdFrontUrl ? (
                          <div className="space-y-3">
                            <img 
                              src={userProfile.user.govIdFrontUrl} 
                              alt="Government ID Front"
                              className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => window.open(userProfile.user.govIdFrontUrl, '_blank')}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-gray-500 text-sm">Image unavailable</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => window.open(userProfile.user.govIdFrontUrl, '_blank')}
                            >
                              View Full Size
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Not uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* Government ID Back */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-3">Government ID - Back</h5>
                        {userProfile.user.govIdBackUrl ? (
                          <div className="space-y-3">
                            <img 
                              src={userProfile.user.govIdBackUrl} 
                              alt="Government ID Back"
                              className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => window.open(userProfile.user.govIdBackUrl, '_blank')}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-gray-500 text-sm">Image unavailable</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => window.open(userProfile.user.govIdBackUrl, '_blank')}
                            >
                              View Full Size
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Not uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* Selfie with ID */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-3">Selfie with ID</h5>
                        {userProfile.user.selfieWithIdUrl ? (
                          <div className="space-y-3">
                            <img 
                              src={userProfile.user.selfieWithIdUrl} 
                              alt="Selfie with ID"
                              className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => window.open(userProfile.user.selfieWithIdUrl, '_blank')}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-gray-500 text-sm">Image unavailable</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => window.open(userProfile.user.selfieWithIdUrl, '_blank')}
                            >
                              View Full Size
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Not uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KYC Status Timeline */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">KYC Timeline</h4>
                    <div className="space-y-2 text-sm">
                      {userProfile.user.kycSubmittedAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Submitted: {new Date(userProfile.user.kycSubmittedAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {userProfile.user.kycApprovedAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Approved: {new Date(userProfile.user.kycApprovedAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {userProfile.user.kycFeePaymentId && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Payment ID: {userProfile.user.kycFeePaymentId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Referral History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Who referred this user */}
                  {userProfile.referredBy ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium text-blue-800">Referred By</Label>
                      <p className="text-sm text-blue-700">
                        {userProfile.referredBy.firstName} {userProfile.referredBy.lastName} ({userProfile.referredBy.email})
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Referral Status</Label>
                      <p className="text-sm text-gray-500">This user was not referred by anyone</p>
                    </div>
                  )}

                  {/* People this user has referred */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Users Referred by This User ({userProfile.referrals.length})
                    </Label>
                    {userProfile.referrals.length > 0 ? (
                      <div className="space-y-2">
                        {userProfile.referrals.map((referral: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {referral.referredUser ? 
                                    `${referral.referredUser.firstName} ${referral.referredUser.lastName}` : 
                                    'Unknown User'
                                  }
                                </p>
                                <p className="text-xs text-gray-500">
                                  {referral.referredUser?.email || 'Email not available'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    referral.referredUser?.verificationStatus === 'verified' ? 'default' : 'secondary'
                                  }>
                                    {referral.referredUser?.verificationStatus || 'pending'}
                                  </Badge>
                                  {referral.isEarningCredited ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Coins className="w-3 h-3 mr-1" />
                                      Earned ₹49
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Pending</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No referrals yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistoryData
                      .filter((payment: any) => payment.userId === userProfile.user.id)
                      .map((payment: any) => (
                        <div 
                          key={payment.id} 
                          className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              payment.status === 'completed' ? 'bg-green-500' : 
                              payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.type === 'kyc' ? 'KYC Processing Fee' : 'Account Reactivation Fee'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Order: {payment.orderId || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Method: {payment.paymentMethod || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">₹{payment.amount}</p>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {paymentHistoryData.filter((payment: any) => payment.userId === userProfile.user.id).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm">No payment history found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          KYC and reactivation payments will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Admin Actions Section for Profile Dialog */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <Shield className="w-5 h-5" />
                    Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Status Management */}
                    {userProfile.user.status === 'suspended' ? (
                      <Button
                        onClick={() => {
                          suspendUserMutation.mutate({
                            userId: userProfile.user.id,
                            status: 'active'
                          });
                          setUserProfileDialogOpen(false);
                        }}
                        disabled={suspendUserMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {suspendUserMutation.isPending ? 'Reactivating...' : 'Reactivate Account'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          suspendUserMutation.mutate({
                            userId: userProfile.user.id,
                            status: 'suspended'
                          });
                          setUserProfileDialogOpen(false);
                        }}
                        disabled={suspendUserMutation.isPending}
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend Account'}
                      </Button>
                    )}
                    
                    {/* Delete Profile */}
                    <Button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete ${userProfile.user.firstName} ${userProfile.user.lastName}'s profile?\n\nThis action will:\n• Delete all user data\n• Remove payment history\n• Remove referral connections\n• Cannot be undone\n\nType the user's email to confirm: ${userProfile.user.email}`)) {
                          const confirmation = prompt(`To confirm deletion, please type the user's email address:\n${userProfile.user.email}`);
                          if (confirmation === userProfile.user.email) {
                            deleteUserMutation.mutate(userProfile.user.id);
                            setUserProfileDialogOpen(false);
                            setSelectedUserProfile(null);
                          } else {
                            alert('Email confirmation did not match. Deletion cancelled.');
                          }
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Profile Permanently'}
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">
                      ⚠️ <strong>Warning:</strong> These are irreversible administrative actions. Account suspension prevents user login and access to earnings. Profile deletion permanently removes all user data from the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>Unable to load user profile</p>
              <p className="text-xs mt-2">Selected user: {selectedUserProfile?.email}</p>
              <p className="text-xs">Loading state: {isLoadingProfile ? 'loading' : 'not loading'}</p>
              {error && (
                <p className="text-xs text-red-600 mt-2">Error: {(error as any)?.message || 'Unknown error'}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
