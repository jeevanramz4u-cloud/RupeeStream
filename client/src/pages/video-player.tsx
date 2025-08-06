import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Coins, Clock, Eye, Play, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function VideoPlayer() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["/api/videos", id],
    enabled: !!id,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/video-progress", id],
    enabled: !!id && !!user,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (seconds: number) => {
      await apiRequest("PUT", `/api/video-progress/${id}`, { watchedSeconds: seconds });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const completeVideoMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/video-progress/${id}/complete`);
    },
    onSuccess: () => {
      setHasCompleted(true);
      toast({
        title: "Video Completed!",
        description: `You earned ₹${video?.earning} for watching this video.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  useEffect(() => {
    if (progress) {
      setWatchedSeconds(progress.watchedSeconds || 0);
      setHasCompleted(progress.isCompleted || false);
    }
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      setWatchedSeconds(currentTime);
      
      // Update progress every 30 seconds
      if (currentTime % 30 === 0 && currentTime > 0) {
        updateProgressMutation.mutate(currentTime);
      }
    };

    const handleEnded = () => {
      if (!hasCompleted) {
        completeVideoMutation.mutate();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Disable seeking
    const handleSeeking = () => {
      video.currentTime = watchedSeconds;
      toast({
        title: "Seeking Disabled",
        description: "You cannot skip or rewind the video.",
        variant: "destructive",
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
    };
  }, [watchedSeconds, hasCompleted, updateProgressMutation, completeVideoMutation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Video Not Found</h2>
            <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/videos")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = video.duration > 0 ? (watchedSeconds / video.duration) * 100 : 0;
  const remainingTime = Math.max(video.duration - watchedSeconds, 0);
  const canEarn = !hasCompleted && !progress?.isEarningCredited;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/videos")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {video.views.toLocaleString()} views
            </span>
            <span className="flex items-center text-accent font-semibold">
              <Coins className="w-4 h-4 mr-1" />
              ₹{video.earning}
            </span>
          </div>
        </div>

        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="bg-gray-900 rounded-t-lg aspect-video flex items-center justify-center relative">
              {video.url ? (
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-t-lg"
                  controls
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mb-4 opacity-50 mx-auto" />
                  <p className="text-sm opacity-75">Video Player</p>
                  <p className="text-xs opacity-50 mt-1">Forward/Skip controls disabled</p>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}% watched</span>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-4" />
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Watched: {Math.floor(watchedSeconds / 60)}:{(watchedSeconds % 60).toString().padStart(2, '0')}</span>
                <span>Remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earning Status */}
        {canEarn ? (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <strong>Complete the video to earn ₹{video.earning}</strong>
              <br />
              You cannot skip or fast-forward. Watch the full video to receive your earnings.
            </AlertDescription>
          </Alert>
        ) : hasCompleted ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Coins className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Video completed!</strong> You have earned ₹{video.earning} for watching this video.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have already earned from this video.
            </AlertDescription>
          </Alert>
        )}

        {/* Video Description */}
        {video.description && (
          <Card>
            <CardHeader>
              <CardTitle>About this video</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{video.description}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
