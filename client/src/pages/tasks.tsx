import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smartphone, 
  Star, 
  Youtube, 
  MessageCircle, 
  ThumbsUp, 
  FileText,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Upload,
  ExternalLink,
  Coins,
  Zap,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/image-upload";

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

const taskCategoryColors = {
  app_download: "bg-blue-100 text-blue-700 border-blue-200",
  business_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  product_review: "bg-green-100 text-green-700 border-green-200",
  channel_subscribe: "bg-red-100 text-red-700 border-red-200",
  comment_like: "bg-purple-100 text-purple-700 border-purple-200",
  youtube_video_see: "bg-pink-100 text-pink-700 border-pink-200",
  survey: "bg-indigo-100 text-indigo-700 border-indigo-200",
  social_media: "bg-teal-100 text-teal-700 border-teal-200"
};

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [proofData, setProofData] = useState("");
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["/api/task-completions"],
    enabled: !!user,
  });

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeCompletions = Array.isArray(completions) ? completions : [];

  const submitTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string; proofData: string; proofImages: string[] }) => {
      const response = await apiRequest("POST", "/api/task-completions", data);
      const result = await response.json();
      if (!response.ok) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Task Submitted!",
        description: "Your task submission is under review. You'll receive payment once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      setIsSubmitDialogOpen(false);
      setProofData("");
      setProofImages([]);
      setSelectedTask(null);
    },
    onError: (error: any) => {
      // Handle specific error types
      if (error.errorType === 'kyc_pending') {
        toast({
          title: "KYC Verification Required",
          description: "Please complete your KYC verification to start earning from tasks. Go to Profile > KYC Verification.",
          variant: "destructive",
        });
      } else if (error.errorType === 'suspended') {
        toast({
          title: "Account Suspended",
          description: "Your account is suspended. Please reactivate your account to complete tasks.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit task. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmitTask = () => {
    if (!selectedTask || (!proofData.trim() && proofImages.length === 0)) {
      toast({
        title: "Missing Information",
        description: "Please provide proof of task completion (text description or screenshots).",
        variant: "destructive",
      });
      return;
    }

    submitTaskMutation.mutate({
      taskId: selectedTask.id,
      proofData: proofData.trim(),
      proofImages: proofImages,
    });
  };

  const getTaskCompletion = (taskId: string) => {
    return safeCompletions.find((c: any) => c.taskId === taskId);
  };

  const isTaskCompleted = (taskId: string) => {
    const completion = getTaskCompletion(taskId);
    return completion && ['approved', 'submitted'].includes(completion.status);
  };

  const getCompletionStatus = (taskId: string) => {
    const completion = getTaskCompletion(taskId);
    return completion?.status || null;
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to access tasks.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
            Complete Tasks & Earn Money
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Multiple ways to earn with instant payments. Complete simple tasks and start earning today!
          </p>
          
          {/* Task Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="outline" className="px-4 py-2 text-blue-700 border-blue-200 bg-blue-50">
              <Smartphone className="w-4 h-4 mr-2" />
              App Downloads
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-yellow-700 border-yellow-200 bg-yellow-50">
              <Star className="w-4 h-4 mr-2" />
              Business Reviews
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-green-700 border-green-200 bg-green-50">
              <FileText className="w-4 h-4 mr-2" />
              Product Reviews
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-red-700 border-red-200 bg-red-50">
              <Youtube className="w-4 h-4 mr-2" />
              Channel Subscribe
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-purple-700 border-purple-200 bg-purple-50">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Comments & Likes
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-pink-700 border-pink-200 bg-pink-50">
              <Eye className="w-4 h-4 mr-2" />
              YouTube Video View
            </Badge>
          </div>
        </div>

        {/* Task Grid */}
        {tasksLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading available tasks...</p>
          </div>
        ) : safeTasks.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Available</h3>
            <p className="text-gray-500">New tasks will be added soon. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeTasks.map((task: any) => {
              const IconComponent = taskCategoryIcons[task.category as keyof typeof taskCategoryIcons] || FileText;
              const colorClass = taskCategoryColors[task.category as keyof typeof taskCategoryColors] || "bg-gray-100 text-gray-700 border-gray-200";
              const completion = getTaskCompletion(task.id);
              const isCompleted = isTaskCompleted(task.id);
              const status = getCompletionStatus(task.id);

              return (
                <Card key={task.id} className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${colorClass} border`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {task.category.replace('_', ' ')}
                      </Badge>
                      <div className="text-right">
                        <div className="flex items-center text-green-600 font-bold">
                          <Coins className="w-4 h-4 mr-1" />
                          ₹{task.reward}
                        </div>
                        {task.timeLimit && (
                          <div className="flex items-center text-gray-500 text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.timeLimit}min
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      {task.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {task.description}
                    </p>
                    
                    {task.requirements && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="font-semibold text-gray-700 text-xs mb-2">Requirements:</h4>
                        <p className="text-xs text-gray-600">{task.requirements}</p>
                      </div>
                    )}
                    
                    {/* Completion limit */}
                    {task.maxCompletions && (
                      <div className="text-xs text-gray-500 mb-4">
                        {task.currentCompletions}/{task.maxCompletions} completed
                      </div>
                    )}
                    
                    {/* Action Button */}
                    {status === 'approved' ? (
                      <Button disabled className="w-full bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed & Paid
                      </Button>
                    ) : status === 'submitted' ? (
                      <Button disabled className="w-full bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Clock className="w-4 h-4 mr-2" />
                        Under Review
                      </Button>
                    ) : status === 'rejected' ? (
                      <Button 
                        onClick={() => {
                          // Check if user is verified before opening task dialog
                          if (user?.status === 'suspended') {
                            toast({
                              title: "Account Suspended",
                              description: "Your account is suspended. Please reactivate your account to complete tasks.",
                              variant: "destructive",
                            });
                            return;
                          }
                          if (user?.verificationStatus !== 'verified' || user?.kycStatus !== 'approved') {
                            toast({
                              title: "KYC Verification Pending",
                              description: "Please complete your KYC verification to start earning from tasks. Go to Profile > KYC Verification.",
                              variant: "destructive",
                            });
                            return;
                          }
                          setSelectedTask(task);
                          setIsSubmitDialogOpen(true);
                        }}
                        className="w-full bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Resubmit Task
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          // Debug user data
                          console.log("Start Task clicked - User verification check:", {
                            userId: user?.id,
                            status: user?.status,
                            verificationStatus: user?.verificationStatus,
                            kycStatus: user?.kycStatus,
                            kycFeePaid: user?.kycFeePaid,
                            canAccessTasks: user?.status !== 'suspended' && user?.verificationStatus === 'verified' && user?.kycStatus === 'approved'
                          });
                          
                          // Check if user is verified before opening task dialog
                          if (user?.status === 'suspended') {
                            toast({
                              title: "Account Suspended",
                              description: "Your account is suspended. Please reactivate your account to complete tasks.",
                              variant: "destructive",
                            });
                            return;
                          }
                          if (user?.verificationStatus !== 'verified' || user?.kycStatus !== 'approved') {
                            toast({
                              title: "KYC Verification Pending",
                              description: `Verification required. Status: ${user?.verificationStatus || 'unknown'}, KYC: ${user?.kycStatus || 'unknown'}. Please complete your KYC verification to start earning from tasks.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          setSelectedTask(task);
                          setIsSubmitDialogOpen(true);
                        }}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-semibold"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Start Task
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Submit Task Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Submit Task: {selectedTask?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Image Upload Section */}
              <ImageUpload 
                onImagesChange={setProofImages} 
                currentImages={proofImages}
                maxImages={3}
              />
              
              {/* Text Description Section */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  placeholder="Provide additional context, links, or descriptions to supplement your screenshots..."
                  value={proofData}
                  onChange={(e) => setProofData(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Screenshots are the primary proof. Use this field for additional details if needed.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setIsSubmitDialogOpen(false);
                    setProofData("");
                    setProofImages([]);
                    setSelectedTask(null);
                  }}
                  className="w-full sm:flex-1"
                  data-testid="cancel-task-submission"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmitTask}
                  disabled={submitTaskMutation.isPending || (proofData.trim() === "" && proofImages.length === 0)}
                  className="w-full sm:flex-1 bg-gradient-to-r from-primary to-blue-600"
                  data-testid="submit-task-button"
                >
                  {submitTaskMutation.isPending ? "Submitting..." : "Submit Task"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
}