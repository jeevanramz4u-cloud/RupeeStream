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
  const [youtubeWatchStartTime, setYoutubeWatchStartTime] = useState<Date | null>(null);
  const [isWatchingOnYoutube, setIsWatchingOnYoutube] = useState(false);
  const [requiredWatchTime, setRequiredWatchTime] = useState(0);
  const [currentWatchTime, setCurrentWatchTime] = useState(0);

  const { data: video, isLoading } = useQuery<any>({
    queryKey: ["/api/videos", id],
    enabled: !!id,
  });

  const { data: progress } = useQuery<any>({
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
        description: `You earned ₹${videoEarning} for watching this video.`,
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
      setWatchedSeconds(progressWatchedSeconds);
      setHasCompleted(progressIsCompleted);
    }
  }, [progress, progressWatchedSeconds, progressIsCompleted]);

  useEffect(() => {
    // Set required watch time based on video duration (minimum 80% of video duration)
    if (video && videoDuration > 0) {
      setRequiredWatchTime(Math.floor(videoDuration * 0.8));
    }
  }, [video, videoDuration]);

  // Real-time timer for YouTube watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingOnYoutube && youtubeWatchStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - youtubeWatchStartTime.getTime()) / 1000);
        setCurrentWatchTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWatchingOnYoutube, youtubeWatchStartTime]);

  // Safe accessors
  const videoTitle = video?.title || 'Loading...';
  const videoEarning = video?.earning || '0';
  const videoUrl = video?.url || '';
  const videoThumbnail = video?.thumbnailUrl || null;
  const videoDuration = video?.duration || 0;
  const videoViews = video?.views || 0;
  const videoDescription = video?.description || '';
  const progressWatchedSeconds = progress?.watchedSeconds || 0;
  const progressIsCompleted = progress?.isCompleted || false;
  const progressIsEarningCredited = progress?.isEarningCredited || false;

  // Check if this is a YouTube video
  const isYouTubeVideo = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  useEffect(() => {
    // Only add event listeners for direct video files, not YouTube iframes
    const videoElement = videoRef.current;
    if (!videoElement || isYouTubeVideo) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(videoElement.currentTime);
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
      videoElement.currentTime = watchedSeconds;
      toast({
        title: "Seeking Disabled",
        description: "You cannot skip or rewind the video.",
        variant: "destructive",
      });
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeking', handleSeeking);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeking', handleSeeking);
    };
  }, [watchedSeconds, hasCompleted, updateProgressMutation, completeVideoMutation, toast, isYouTubeVideo]);

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

  const progressPercentage = videoDuration > 0 ? (watchedSeconds / videoDuration) * 100 : 0;
  const remainingTime = Math.max(videoDuration - watchedSeconds, 0);
  const canEarn = !hasCompleted && !progressIsEarningCredited;

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{videoTitle}</h1>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {videoViews.toLocaleString()} views
            </span>
            <span className="flex items-center text-accent font-semibold">
              <Coins className="w-4 h-4 mr-1" />
              ₹{videoEarning}
            </span>
          </div>
        </div>

        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="bg-gray-900 rounded-t-lg aspect-video flex items-center justify-center relative">
              {videoUrl ? (
                isYouTubeVideo ? (
                  // YouTube viewing options with ad blocker awareness
                  <div className="w-full h-full relative bg-gray-800 rounded-t-lg flex flex-col">
                    {/* YouTube thumbnail and play instructions */}
                    <div className="flex-1 flex flex-col items-center justify-center text-white p-8">
                      {videoThumbnail && (
                        <img 
                          src={videoThumbnail} 
                          alt={videoTitle}
                          className="w-48 h-36 object-cover rounded mb-4 shadow-lg"
                        />
                      )}
                      <h3 className="text-xl font-semibold mb-4 text-center">{videoTitle}</h3>
                      
                      <div className="text-center space-y-3 mb-6">
                        <p className="text-gray-300">Watch this video on YouTube to earn ₹{videoEarning}</p>
                        <p className="text-sm text-yellow-400">
                          Required watch time: {Math.floor(requiredWatchTime / 60)}:{(requiredWatchTime % 60).toString().padStart(2, '0')} minutes
                        </p>
                        {isWatchingOnYoutube && youtubeWatchStartTime && (
                          <div className="text-sm text-green-400 bg-green-900/20 px-3 py-1 rounded">
                            ⏱️ Watching for: {Math.floor(currentWatchTime / 60)}:{(currentWatchTime % 60).toString().padStart(2, '0')}
                            {currentWatchTime >= requiredWatchTime && (
                              <span className="ml-2 text-green-300">✓ Eligible to complete!</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-yellow-400">
                          Note: If ad blockers prevent embedded playback, click "Open on YouTube" below
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => {
                            window.open(videoUrl, '_blank');
                            setYoutubeWatchStartTime(new Date());
                            setIsWatchingOnYoutube(true);
                            toast({
                              title: "YouTube Video Opened",
                              description: `Watch for at least ${Math.floor(requiredWatchTime / 60)} minutes to earn money.`,
                            });
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Open on YouTube
                        </Button>
                        
                        {!hasCompleted && (
                          <Button
                            onClick={() => {
                              // Verify user has watched for required time
                              if (!youtubeWatchStartTime) {
                                toast({
                                  title: "Watch Required",
                                  description: "Please click 'Open on YouTube' and watch the video first.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              if (currentWatchTime < requiredWatchTime) {
                                const remainingTime = Math.floor((requiredWatchTime - currentWatchTime) / 60);
                                const remainingSeconds = (requiredWatchTime - currentWatchTime) % 60;
                                toast({
                                  title: "Insufficient Watch Time",
                                  description: `You need to watch for ${remainingTime}:${remainingSeconds.toString().padStart(2, '0')} more to earn money.`,
                                  variant: "destructive",
                                });
                                return;
                              }

                              completeVideoMutation.mutate();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                            disabled={completeVideoMutation.isPending}
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            {completeVideoMutation.isPending ? 'Processing...' : 'Mark as Completed'}
                          </Button>
                        )}
                        
                        {hasCompleted && (
                          <div className="flex items-center bg-green-800 text-green-200 px-4 py-2 rounded">
                            <Coins className="w-4 h-4 mr-2" />
                            Video Completed!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Optional: Try embedded player with error handling */}
                    <div className="border-t border-gray-700 p-4">
                      <details className="text-white">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                          Try Embedded Player (may not work with ad blockers)
                        </summary>
                        <div className="mt-3 aspect-video">
                          <iframe
                            className="w-full h-full rounded"
                            src={(() => {
                              let embedUrl = videoUrl;
                              if (embedUrl.includes('youtube.com/watch?v=')) {
                                embedUrl = embedUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/');
                              } else if (embedUrl.includes('youtu.be/')) {
                                embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
                              }
                              embedUrl += embedUrl.includes('?') ? '&' : '?';
                              embedUrl += 'autoplay=0&controls=1&modestbranding=1&rel=0';
                              return embedUrl;
                            })()}
                            title={videoTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </details>
                    </div>
                  </div>
                ) : (
                  // Regular video player for direct video files
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-t-lg"
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mb-4 opacity-50 mx-auto" />
                  <p className="text-sm opacity-75">Video Player</p>
                  <p className="text-xs opacity-50 mt-1">Watch completely to earn</p>
                </div>
              )}
            </div>
            
            {/* Progress Bar - Only for non-YouTube videos */}
            {!isYouTubeVideo && (
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
            )}
            
            {/* Instructions for YouTube videos */}
            {isYouTubeVideo && (
              <div className="p-4 bg-blue-50 border-t">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">How to earn from this video:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Click "Open on YouTube" to watch the video</li>
                      <li>Watch the complete video on YouTube</li>
                      <li>Return here and click "Mark as Completed" to earn ₹{videoEarning}</li>
                    </ol>
                    <p className="text-xs text-blue-600 mt-2">
                      Status: {hasCompleted ? '✅ Completed' : '⏳ Pending completion'}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
