import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertTriangle
} from "lucide-react";

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

export default function Tasks() {
  const { user } = useAuth();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["/api/task-completions"],
    enabled: !!user,
  });

  // Ensure tasks is always an array
  const tasksList = Array.isArray(tasks) ? tasks : [];

  // Get completion status for a task
  const getTaskCompletionStatus = (taskId: string) => {
    const completion = completions.find((c: any) => c.taskId === taskId && c.userId === user?.id);
    return completion?.status || null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access tasks</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Complete Tasks & Earn Money</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Browse available tasks across 6 categories and start earning immediately!
          </p>
        </div>

        {/* Tasks Table */}
        {tasksLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="h-12 bg-gray-200 rounded w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : tasksList.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Tasks Available</h3>
              <p className="text-gray-600 mb-6">Check back soon for new earning opportunities!</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Tasks ({tasksList.length})</span>
                <Badge variant="outline" className="text-sm">
                  {tasksList.filter(t => t.isActive).length} Active Tasks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead className="hidden sm:table-cell">Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasksList.map((task: any) => {
                      const IconComponent = taskCategoryIcons[task.category as keyof typeof taskCategoryIcons] || FileText;
                      const status = getTaskCompletionStatus(task.id);
                      
                      return (
                        <TableRow key={task.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate max-w-xs">
                                  {task.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-xs md:hidden">
                                  {task.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {task.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600 flex items-center">
                              <Coins className="w-3 h-3 mr-1" />
                              ₹{task.reward}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="flex items-center text-gray-600 text-sm">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.timeLimit}min
                            </span>
                          </TableCell>
                          <TableCell>
                            {status === 'approved' ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">✓</span>
                              </Badge>
                            ) : status === 'pending' ? (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Review</span>
                                <span className="sm:hidden">⏳</span>
                              </Badge>
                            ) : status === 'rejected' ? (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Rejected</span>
                                <span className="sm:hidden">✗</span>
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Available</span>
                                <span className="sm:hidden">📋</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link href={`/task/${task.id}`}>
                              <Button size="sm" variant="outline" className="text-xs px-2 sm:px-3">
                                <ExternalLink className="w-3 h-3 mr-1 sm:mr-1" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Categories Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Task Categories Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-blue-800">App Downloads</div>
                <div className="text-xs text-blue-600">₹5-25</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-yellow-800">Business Reviews</div>
                <div className="text-xs text-yellow-600">₹5-35</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-green-800">Product Reviews</div>
                <div className="text-xs text-green-600">₹5-40</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Youtube className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-red-800">Channel Subscribe</div>
                <div className="text-xs text-red-600">₹5-20</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-purple-800">Comments & Likes</div>
                <div className="text-xs text-purple-600">₹5-15</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Eye className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-pink-800">YouTube View</div>
                <div className="text-xs text-pink-600">₹5-30</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}