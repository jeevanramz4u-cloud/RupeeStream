import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  Star, 
  Youtube, 
  MessageCircle, 
  ThumbsUp, 
  FileText,
  Clock,
  Coins,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Play,
  Timer,
  Users,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/image-upload";

// Task-specific instructions and requirements
const getTaskInstructions = (category: string) => {
  switch (category) {
    case 'app_download':
      return {
        steps: [
          "Click 'Start Task' to open the app store link",
          "Download and install the app on your device",
          "Create an account using valid details",
          "Open the app and complete initial setup",
          "Take screenshot of successful installation and account creation"
        ],
        proofRequired: "Screenshots showing: 1) App installed on device, 2) Account creation confirmation, 3) App home screen with your profile",
        tips: "Ensure app is fully functional before submitting. Use real details for account creation."
      };
    case 'business_review':
      return {
        steps: [
          "Click 'Start Task' to open the business page",
          "Find the business on Google Maps/review platform",
          "Write a detailed, honest review (minimum 50 words)",
          "Rate the business appropriately (4-5 stars typically)",
          "Submit your review and wait for approval"
        ],
        proofRequired: "Screenshot showing: 1) Your published review with your name visible, 2) Rating given, 3) Review text clearly visible",
        tips: "Write genuine, helpful reviews. Mention specific services or experiences. Avoid generic comments."
      };
    case 'product_review':
      return {
        steps: [
          "Click 'Start Task' to open the product page",
          "Read product details and specifications carefully",
          "Write a comprehensive review based on features/description",
          "Rate the product fairly (include pros and cons)",
          "Submit review on the platform"
        ],
        proofRequired: "Screenshot showing: 1) Your published review with rating, 2) Review content visible, 3) Your reviewer profile/name",
        tips: "Focus on product features, value for money, and potential use cases. Be detailed and helpful."
      };
    case 'channel_subscribe':
      return {
        steps: [
          "Click 'Start Task' to open the YouTube channel",
          "Subscribe to the channel by clicking Subscribe button",
          "Like the most recent video on the channel",
          "Optional: Leave a positive comment on the video",
          "Take screenshots showing your subscription and like"
        ],
        proofRequired: "Screenshots showing: 1) Subscribed status with notification bell, 2) Liked video with thumbs up highlighted, 3) Channel subscriber count increased",
        tips: "Make sure you're logged into your YouTube account. Engagement helps creators grow their channel."
      };
    case 'comment_like':
      return {
        steps: [
          "Click 'Start Task' to open the social media post",
          "Like the post by clicking the like/heart button",
          "Write a meaningful comment (minimum 10 words)",
          "Engage naturally - avoid spam-like behavior",
          "Take screenshots showing your interaction"
        ],
        proofRequired: "Screenshots showing: 1) Your like on the post, 2) Your comment posted with your username, 3) Post engagement metrics",
        tips: "Write genuine comments that add value. Avoid generic phrases like 'nice post' or 'good job'."
      };
    case 'youtube_video_see':
      return {
        steps: [
          "Click 'Start Task' to open the YouTube video",
          "Watch at least 80% of the video duration",
          "Like the video and subscribe to the channel",
          "Leave a thoughtful comment about the video content",
          "Take screenshots of your engagement"
        ],
        proofRequired: "Screenshots showing: 1) Video watch time/progress, 2) Your like and subscription, 3) Your comment on the video",
        tips: "Actually watch the video to leave meaningful comments. Creators value genuine engagement over fake views."
      };
    default:
      return {
        steps: [
          "Click 'Start Task' to open the task link",
          "Follow the specific instructions provided",
          "Complete the required actions thoroughly",
          "Gather proof of completion as specified",
          "Submit your proof for review"
        ],
        proofRequired: "Screenshots or evidence as specified in the task requirements",
        tips: "Read all instructions carefully before starting. Quality submissions get approved faster."
      };
  }
};

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

export default function TaskDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Extract task ID from URL
  const taskId = window.location.pathname.split('/task/')[1];
  
  const [proofData, setProofData] = useState("");
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [taskStarted, setTaskStarted] = useState(false);

  const { data: task, isLoading: taskLoading } = useQuery<any>({
    queryKey: ["/api/tasks", taskId],
    enabled: !!taskId && !!user,
  });

  const { data: completions = [] } = useQuery<any[]>({
    queryKey: ["/api/task-completions"],
    enabled: !!user,
  });

  // Timer effect for task time limit
  useEffect(() => {
    if (taskStarted && task?.timeLimit && timeLeft === null) {
      setTimeLeft(task.timeLimit * 60); // Convert minutes to seconds
    }
    
    if (taskStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0) ? prev - 1 : 0);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [taskStarted, task?.timeLimit, timeLeft]);

  // Get completion status for this task
  const getTaskCompletionStatus = () => {
    const completion = completions.find((c: any) => c.taskId === taskId && c.userId === user?.id);
    return completion?.status || null;
  };

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
      setTaskStarted(false);
      setTimeLeft(null);
    },
    onError: (error: any) => {
      if (error.errorType === 'kyc_pending') {
        toast({
          title: "KYC Verification Required",
          description: "Please complete your KYC verification to start earning from tasks.",
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
    if (!task || (!proofData.trim() && proofImages.length === 0)) {
      toast({
        title: "Proof Required",
        description: "Please provide either screenshots or text description as proof of completion.",
        variant: "destructive",
      });
      return;
    }

    submitTaskMutation.mutate({
      taskId: task.id,
      proofData,
      proofImages
    });
  };

  const handleStartTask = () => {
    // Check if user is verified before starting task
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
        description: "Please complete your KYC verification to start earning from tasks.",
        variant: "destructive",
      });
      return;
    }
    
    setTaskStarted(true);
    if (task?.taskLink) {
      window.open(task.taskLink, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view task details</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
            <Button onClick={() => setLocation('/tasks')}>Back to Tasks</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = taskCategoryIcons[task.category as keyof typeof taskCategoryIcons] || FileText;
  const status = getTaskCompletionStatus();
  const taskInstructions = getTaskInstructions(task.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Button 
          variant="outline" 
          onClick={() => setLocation('/tasks')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Task Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {task.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {task.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      <span className="flex items-center text-green-600 font-bold text-lg">
                        <Coins className="w-5 h-5 mr-1" />
                        ₹{task.reward}
                      </span>
                      {task.timeLimit && (
                        <span className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.timeLimit} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Task Description</h3>
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                </div>

                {/* Category-specific instructions */}
                {task.category === 'app_download' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Step-by-Step Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                      <li>Click the task link to visit the app store page</li>
                      <li>Download and install the application</li>
                      <li>Open the app and complete registration with valid details</li>
                      <li>Take a screenshot of the successful installation/registration</li>
                      <li>Submit the screenshot as proof of completion</li>
                    </ol>
                  </div>
                )}

                {task.category === 'business_review' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Review Guidelines:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      <li>Write an honest, detailed review (minimum 50 words)</li>
                      <li>Rate the business with 4-5 stars</li>
                      <li>Mention specific aspects like service quality, location, etc.</li>
                      <li>Use authentic language - avoid generic templates</li>
                      <li>Take a screenshot of your published review</li>
                    </ul>
                  </div>
                )}

                {task.category === 'product_review' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Product Review Process:</h4>
                    <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                      <li>Visit the product page using the provided link</li>
                      <li>Read existing reviews to understand the product</li>
                      <li>Write a balanced review covering pros and cons</li>
                      <li>Include details about quality, value for money, etc.</li>
                      <li>Submit screenshot showing your published review</li>
                    </ol>
                  </div>
                )}

                {task.category === 'channel_subscribe' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Subscription Steps:</h4>
                    <ol className="list-decimal list-inside text-sm text-red-800 space-y-1">
                      <li>Click the link to visit the YouTube channel</li>
                      <li>Click the "Subscribe" button (bell icon optional)</li>
                      <li>Like the most recent video on the channel</li>
                      <li>Take screenshot showing subscription confirmation</li>
                      <li>Include screenshot of the liked video</li>
                    </ol>
                  </div>
                )}

                {task.category === 'comment_like' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Engagement Instructions:</h4>
                    <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                      <li>Like the specified post/content</li>
                      <li>Write a meaningful comment (avoid spam)</li>
                      <li>Keep comments positive and relevant</li>
                      <li>No offensive or inappropriate language</li>
                      <li>Screenshot both the like and your comment</li>
                    </ul>
                  </div>
                )}

                {task.category === 'youtube_video_see' && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-900 mb-2">Video Viewing Requirements:</h4>
                    <ol className="list-decimal list-inside text-sm text-pink-800 space-y-1">
                      <li>Watch at least 80% of the video duration</li>
                      <li>Like the video if you find it helpful</li>
                      <li>Leave a thoughtful comment about the content</li>
                      <li>Screenshot the video showing your view time</li>
                      <li>Include screenshot of your comment</li>
                    </ol>
                  </div>
                )}

                {task.requirements && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Specific Requirements</h3>
                    <p className="text-gray-700 leading-relaxed">{task.requirements}</p>
                  </div>
                )}

                {task.taskLink && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Task Link</h3>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a 
                        href={task.taskLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                      >
                        {task.taskLink}
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This link will open automatically when you start the task
                    </p>
                  </div>
                )}

                {/* Step-by-step Instructions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    How to Complete This Task
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    {taskInstructions.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm text-blue-900">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ShieldCheck className="w-5 h-5 text-yellow-600 mr-2" />
                    Proof Required for Approval
                  </h3>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-900">{taskInstructions.proofRequired}</p>
                  </div>
                </div>

                {/* Tips for Success */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-green-600 mr-2" />
                    Tips for Success
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-900">{taskInstructions.tips}</p>
                  </div>
                </div>

                {/* Task Progress Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {task.currentCompletions}/{task.maxCompletions} completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 capitalize">
                        {task.verificationMethod} verification
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Action Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer display */}
                {taskStarted && timeLeft !== null && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-800">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-blue-600">Time Remaining</div>
                  </div>
                )}

                {/* Task status and actions */}
                {status === 'approved' ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-800">Task Completed!</div>
                    <div className="text-sm text-green-600 mt-1">Payment has been credited</div>
                  </div>
                ) : status === 'pending' ? (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                    <div className="font-semibold text-yellow-800">Under Review</div>
                    <div className="text-sm text-yellow-600 mt-1">Your submission is being reviewed</div>
                  </div>
                ) : status === 'rejected' ? (
                  <div className="text-center p-4 bg-red-50 rounded-lg mb-4">
                    <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                    <div className="font-semibold text-red-800">Task Rejected</div>
                    <div className="text-sm text-red-600 mt-1">Please resubmit with correct proof</div>
                  </div>
                ) : !taskStarted ? (
                  <Button 
                    onClick={handleStartTask}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-semibold py-3"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Task & Open Link
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsSubmitDialogOpen(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 font-semibold py-3"
                    size="lg"
                    disabled={timeLeft === 0}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Proof
                  </Button>
                )}

                {!taskStarted && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Quick Start Guide:</div>
                    <div className="text-xs text-gray-600 space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                        <span>Click "Start Task" to begin timer</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                        <span>Complete task on the opened link</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                        <span>Take clear screenshots as proof</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">4</div>
                        <span>Submit for admin review</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">5</div>
                        <span>Get paid within 5-20 minutes!</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Task Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Submit Task: {task.title}
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
      </main>
      
      <Footer />
    </div>
  );
}