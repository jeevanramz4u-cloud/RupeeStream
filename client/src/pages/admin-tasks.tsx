import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Smartphone, 
  Star, 
  Youtube, 
  MessageCircle, 
  ThumbsUp, 
  FileText,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Brain,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import AITaskSuggestions from "@/components/AITaskSuggestions";
import AISmartCategorization from "@/components/AISmartCategorization";
import AIContentOptimizer from "@/components/AIContentOptimizer";

const taskCategoryIcons = {
  app_download: Smartphone,
  business_review: Star,
  product_review: FileText,
  channel_subscribe: Youtube,
  comment_like: MessageCircle,
  youtube_video_see: Eye,
  survey: FileText,
  social_media: ThumbsUp
};

export default function AdminTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isCompletionsDialogOpen, setIsCompletionsDialogOpen] = useState(false);
  const [selectedTaskCompletions, setSelectedTaskCompletions] = useState<any[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "app_download",
    reward: "",
    timeLimit: "",
    maxCompletions: "",
    requirements: "",
    taskLink: "",
    verificationMethod: "manual"
  });

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
      resetTaskForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Updated", description: "Task has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/tasks/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Deleted", description: "Task has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
    },
  });

  const approveCompletionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/admin/task-completions/${id}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Approved", description: "Payment has been credited to user." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/task-completions"] });
    },
  });

  const rejectCompletionMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest("PUT", `/api/admin/task-completions/${id}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Rejected", description: "Task completion has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/task-completions"] });
    },
  });

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      category: "app_download",
      reward: "",
      timeLimit: "",
      maxCompletions: "",
      requirements: "",
      taskLink: "",
      verificationMethod: "manual"
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.reward || !newTask.taskLink) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including task link.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      ...newTask,
      reward: parseFloat(newTask.reward),
      timeLimit: newTask.timeLimit ? parseInt(newTask.timeLimit) : null,
      maxCompletions: newTask.maxCompletions ? parseInt(newTask.maxCompletions) : null,
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    updateTaskMutation.mutate({
      id: editingTask.id,
      data: {
        ...editingTask,
        reward: parseFloat(editingTask.reward),
        timeLimit: editingTask.timeLimit ? parseInt(editingTask.timeLimit) : null,
        maxCompletions: editingTask.maxCompletions ? parseInt(editingTask.maxCompletions) : null,
      }
    });
  };

  const viewTaskCompletions = (taskId: string) => {
    const taskCompletions = Array.isArray(completions) ? completions.filter((c: any) => c.taskId === taskId) : [];
    setSelectedTaskCompletions(taskCompletions);
    setIsCompletionsDialogOpen(true);
  };

  // AI functionality handlers
  const handleTaskSuggestionSelect = (suggestion: any) => {
    setNewTask({
      ...newTask,
      title: suggestion.suggestedTitle || "",
      description: suggestion.suggestedDescription || "",
      category: suggestion.category,
      reward: suggestion.estimatedReward.toString(),
      timeLimit: suggestion.estimatedTimeLimit.toString(),
      requirements: "Please provide proof of completion as described.",
      taskLink: ""
    });
    setShowAISuggestions(false);
    setIsCreateDialogOpen(true);
    toast({
      title: "AI Suggestion Applied",
      description: "Task form has been pre-filled with AI suggestions",
    });
  };

  const handleCategorySuggestion = (suggestion: any) => {
    setNewTask({
      ...newTask,
      category: suggestion.category,
      reward: suggestion.estimatedReward.toString(),
      timeLimit: suggestion.estimatedTimeLimit.toString()
    });
    setAiAnalysis(suggestion);
  };

  const handleContentOptimization = (optimization: any) => {
    setNewTask({
      ...newTask,
      title: optimization.optimizedTitle,
      description: optimization.optimizedDescription,
      requirements: optimization.optimizedRequirements
    });
    toast({
      title: "Content Optimized",
      description: "Task content has been enhanced with AI optimization",
    });
  };

  const resetTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      category: "app_download",
      reward: "",
      timeLimit: "",
      maxCompletions: "",
      requirements: "",
      taskLink: "",
      verificationMethod: "manual"
    });
    setAiAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Task Management</h1>
            <p className="text-gray-600 mt-2">Create and manage tasks for users to complete</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAISuggestions(true)}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              data-testid="button-ai-suggestions"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
              data-testid="button-create-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.length : 0}</div>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.filter((t: any) => t.isActive).length : 0}</div>
              <p className="text-sm text-gray-600">Active Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Array.isArray(completions) ? completions.filter((c: any) => c.status === 'submitted').length : 0}</div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Array.isArray(completions) ? completions.filter((c: any) => c.status === 'approved').length : 0}</div>
              <p className="text-sm text-gray-600">Approved Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(tasks) && tasks.map((task: any) => {
            const IconComponent = taskCategoryIcons[task.category as keyof typeof taskCategoryIcons] || FileText;
            const taskCompletions = Array.isArray(completions) ? completions.filter((c: any) => c.taskId === task.id) : [];
            const pendingCount = taskCompletions.filter((c: any) => c.status === 'submitted').length;

            return (
              <Card key={task.id} className="border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={task.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      <IconComponent className="w-3 h-3 mr-1" />
                      {task.category.replace('_', ' ')}
                    </Badge>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">₹{task.reward}</div>
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold leading-tight">
                    {task.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    {task.currentCompletions || 0} completions
                    {task.maxCompletions && ` / ${task.maxCompletions} max`}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTask(task)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewTaskCompletions(task.id)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View ({taskCompletions.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Task Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Task
                {aiAnalysis && (
                  <Badge className="bg-purple-100 text-purple-700">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Task Form */}
              <div className="space-y-4">
                <div>
                  <Label>Task Title *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    data-testid="input-task-title"
                  />
                </div>
                
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe what users need to do"
                    className="min-h-[100px]"
                    data-testid="textarea-task-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <select 
                      value={newTask.category} 
                      onChange={(e) => {
                        console.log('Category changed to:', e.target.value);
                        setNewTask({ ...newTask, category: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="select-task-category"
                    >
                      <option value="youtube_video_see">👁️ YouTube Video See Task</option>
                      <option value="app_download">📱 App Download</option>
                      <option value="business_review">⭐ Business Review</option>
                      <option value="product_review">🛍️ Product Review</option>
                      <option value="channel_subscribe">▶️ Channel Subscribe</option>
                      <option value="comment_like">👍 Comments & Likes</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Current: {newTask.category}</p>
                  </div>
                  
                  <div>
                    <Label>Reward (₹) *</Label>
                    <Input
                      type="number"
                      value={newTask.reward}
                      onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                      placeholder="0.00"
                      data-testid="input-task-reward"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Input
                      type="number"
                      value={newTask.timeLimit}
                      onChange={(e) => setNewTask({ ...newTask, timeLimit: e.target.value })}
                      placeholder="Optional"
                      data-testid="input-task-time-limit"
                    />
                  </div>
                  
                  <div>
                    <Label>Max Completions</Label>
                    <Input
                      type="number"
                      value={newTask.maxCompletions}
                      onChange={(e) => setNewTask({ ...newTask, maxCompletions: e.target.value })}
                      placeholder="Unlimited"
                      data-testid="input-task-max-completions"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Task Link *</Label>
                  <Input
                    value={newTask.taskLink}
                    onChange={(e) => setNewTask({ ...newTask, taskLink: e.target.value })}
                    placeholder="https://example.com/direct-task-link"
                    data-testid="input-task-link"
                  />
                  <p className="text-xs text-gray-500 mt-1">Direct link where users can complete the task</p>
                </div>
                
                <div>
                  <Label>Requirements</Label>
                  <Textarea
                    value={newTask.requirements}
                    onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                    placeholder="Specific requirements for task completion"
                    className="min-h-[80px]"
                    data-testid="textarea-task-requirements"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1" data-testid="button-cancel-task">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending} className="flex-1" data-testid="button-submit-task">
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </div>

              {/* Right Column - AI Features */}
              <div className="space-y-4">
                <AISmartCategorization
                  title={newTask.title}
                  description={newTask.description}
                  onCategorySuggestion={handleCategorySuggestion}
                />
                
                <AIContentOptimizer
                  title={newTask.title}
                  description={newTask.description}
                  requirements={newTask.requirements}
                  onOptimization={handleContentOptimization}
                />
              </div>
            </div>
              

          </DialogContent>
        </Dialog>

        {/* Task Completions Dialog */}
        <Dialog open={isCompletionsDialogOpen} onOpenChange={setIsCompletionsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Completions</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedTaskCompletions.map((completion: any) => (
                <Card key={completion.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">User: {completion.userId}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(completion.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={
                          completion.status === 'approved' ? "bg-green-100 text-green-700" :
                          completion.status === 'rejected' ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {completion.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-sm font-semibold">Proof Data:</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded mt-1">{completion.proofData}</p>
                    </div>
                    
                    {completion.status === 'submitted' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveCompletionMutation.mutate(completion.id)}
                          disabled={approveCompletionMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectCompletionMutation.mutate({ 
                            id: completion.id, 
                            reason: "Does not meet requirements" 
                          })}
                          disabled={rejectCompletionMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {selectedTaskCompletions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No completions found for this task.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Task Suggestions Dialog */}
        <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI-Powered Task Suggestions
              </DialogTitle>
            </DialogHeader>
            <AITaskSuggestions onTaskSuggestionSelect={handleTaskSuggestionSelect} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}