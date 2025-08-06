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
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

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
      setWatchedSeconds(progress.watchedSeconds || 0);
      setHasCompleted(progress.isCompleted || false);
    }
  }, [progress]);

  useEffect(() => {
    // Reset timer when video changes
    if (video && video.duration > 0) {
      setRequiredWatchTime(video.duration);
      setTimerSeconds(0);
      setTimerStarted(false);
    }
  }, [video]);

  // Timer that runs for exact video duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerStarted && !hasCompleted && timerSeconds < videoDuration) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const newTime = prev + 1;
          setCurrentWatchTime(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStarted, hasCompleted, timerSeconds, videoDuration]);

  // Safe accessors
  const videoTitle = video?.title || 'Loading...';
  const videoEarning = video?.earning || '0';
  const videoUrl = video?.url || '';
  const videoThumbnail = video?.thumbnailUrl || null;
  const videoDuration = video?.duration || 0;
  const videoViews = video?.views || 0;
  const videoDescription = video?.description || '';
  
  // Progress accessors
  const hasEarnings = progress?.isEarningCredited || false;

  // Check if this is a YouTube video
  const isYouTubeVideo = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  useEffect(() => {
    // Only add event listeners for direct video files, not YouTube iframes
    const videoElement = videoRef.current;
    if (!videoElement || isYouTubeVideo) return;

    let lastValidTime = 0;

    const handleLoadedData = () => {
      // Set video to start from last watched position
      if (watchedSeconds > 0) {
        videoElement.currentTime = watchedSeconds;
        lastValidTime = watchedSeconds;
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(videoElement.currentTime);
      
      // Prevent seeking forward - only allow natural progression
      if (currentTime > lastValidTime + 2) {
        videoElement.currentTime = lastValidTime;
        toast({
          title: "Seeking Disabled",
          description: "You cannot skip forward in the video.",
          variant: "destructive",
        });
        return;
      }

      // Prevent seeking backward beyond 5 seconds
      if (currentTime < lastValidTime - 5) {
        videoElement.currentTime = lastValidTime;
        toast({
          title: "Seeking Disabled", 
          description: "You cannot rewind the video.",
          variant: "destructive",
        });
        return;
      }

      // Update progress
      if (currentTime > lastValidTime) {
        lastValidTime = currentTime;
        setWatchedSeconds(currentTime);
        
        // Update progress every 10 seconds
        if (currentTime % 10 === 0 && currentTime > 0) {
          updateProgressMutation.mutate(currentTime);
        }
      }
    };

    const handleSeeking = (e: Event) => {
      e.preventDefault();
      videoElement.currentTime = lastValidTime;
    };

    const handleEnded = () => {
      if (!hasCompleted && lastValidTime >= videoDuration - 10) {
        completeVideoMutation.mutate();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (!timerStarted) {
        setTimerStarted(true);
      }
    };
    const handlePause = () => setIsPlaying(false);

    // Disable right-click context menu to prevent controls access
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('seeking', handleSeeking);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('seeking', handleSeeking);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [watchedSeconds, hasCompleted, updateProgressMutation, completeVideoMutation, toast, isYouTubeVideo, videoDuration]);

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
  const canEarn = !hasCompleted && !hasEarnings;

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

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 pb-20">


        {/* Timer Status Alert */}
        {!hasCompleted && !timerStarted && (
          <Alert className="mb-3 border-blue-200 bg-blue-50 touch-manipulation">
            <Clock className="h-3 w-3 text-blue-600" />
            <AlertDescription className="text-blue-700 text-xs">
              <strong>Ready to Watch</strong> - Click play to start earning timer
            </AlertDescription>
          </Alert>
        )}
        
        {/* Earning Status */}
        {canEarn && timerStarted ? (
          <Alert className="mb-3 border-orange-200 bg-orange-50 touch-manipulation">
            <Coins className="h-3 w-3 text-orange-600" />
            <AlertDescription className="text-orange-700 text-xs">
              <strong>Timer Active</strong> - Watch {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')} to earn ₹{videoEarning}
            </AlertDescription>
          </Alert>
        ) : hasCompleted ? (
          <Alert className="mb-3 border-green-200 bg-green-50 touch-manipulation">
            <Coins className="h-3 w-3 text-green-600" />
            <AlertDescription className="text-green-700 text-xs">
              <strong>Completed!</strong> You earned ₹{videoEarning}
            </AlertDescription>
          </Alert>
        ) : hasEarnings ? (
          <Alert className="mb-3 touch-manipulation">
            <Info className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Already earned from this video
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Video Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">{videoTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center flex-shrink-0">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
            </span>
            <span className="flex items-center flex-shrink-0">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {videoViews.toLocaleString()} views
            </span>
            <span className="flex items-center text-green-600 font-semibold flex-shrink-0">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              ₹{videoEarning}
            </span>
          </div>
        </div>

        {/* Video Player */}
        <Card className="mb-3 sm:mb-4 touch-manipulation">
          <CardContent className="p-0">
            <div className="bg-gray-900 rounded-t-lg aspect-video flex items-center justify-center relative overflow-hidden">
              {videoUrl ? (
                isYouTubeVideo ? (
                  // YouTube embedded player
                  <div className="w-full h-full relative bg-black rounded-t-lg">
                    <iframe
                      className="w-full h-full rounded-t-lg"
                      src={(() => {
                        let embedUrl = videoUrl;
                        // Convert YouTube URL to embed format
                        if (embedUrl.includes('youtube.com/watch?v=')) {
                          const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                          embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (embedUrl.includes('youtu.be/')) {
                          const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                          embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                        // Add parameters for better embedding with restricted controls
                        embedUrl += '?autoplay=0&controls=1&modestbranding=1&rel=0&playsinline=1&fs=0&disablekb=1';
                        return embedUrl;
                      })()}
                      title={videoTitle}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => {
                        // Start timer when video loads
                        if (!timerStarted) {
                          setTimerStarted(true);
                          setIsWatchingOnYoutube(true);
                        }
                      }}
                    />
                    

                  </div>
                ) : (
                  // Regular video player for direct video files
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-t-lg object-contain"
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback noseek"
                    disablePictureInPicture
                    disableRemotePlayback
                    playsInline
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
            
            {/* YouTube Controls - Only for YouTube videos */}
            {isYouTubeVideo && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  {!timerStarted ? (
                    <Button
                      onClick={() => {
                        setTimerStarted(true);
                        setIsWatchingOnYoutube(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium touch-manipulation w-full sm:w-auto"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Start Watch Timer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium touch-manipulation w-full sm:w-auto"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Open in YouTube App
                    </Button>
                  )}
                  
                  {!hasCompleted && (
                    <div className="flex flex-col items-center gap-2">
                      {/* Universal Timer Display */}
                      <div className="text-sm text-gray-700 text-center bg-gray-100 px-3 py-2 rounded-lg">
                        <div className="font-semibold">Watch Timer</div>
                        <div className="text-lg font-mono">
                          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-600">
                          {videoDuration > 0 ? Math.floor((timerSeconds / videoDuration) * 100) : 0}% complete
                        </div>
                      </div>
                      <Button
                        onClick={() => completeVideoMutation.mutate()}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium touch-manipulation w-full sm:w-auto"
                        disabled={completeVideoMutation.isPending || timerSeconds < videoDuration}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {completeVideoMutation.isPending ? 'Processing...' : 
                         timerSeconds < videoDuration ? 
                         `Watch ${videoDuration - timerSeconds}s more to complete` : 
                         'Mark as Completed'}
                      </Button>
                      {timerSeconds < videoDuration && (
                        <div className="text-xs text-orange-600 text-center font-medium">
                          Timer must reach {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')} to earn ₹{videoEarning}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Progress Bar and Timer - For non-YouTube videos */}
            {!isYouTubeVideo && (
              <div className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Video Progress</span>
                  <span>{Math.round(progressPercentage)}% played</span>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-4" />
                
                {/* Timer Display for Regular Videos */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Watch Timer</div>
                    <div className="text-lg font-mono font-semibold text-gray-800">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {videoDuration > 0 ? Math.floor((timerSeconds / videoDuration) * 100) : 0}% complete
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Video: {Math.floor(watchedSeconds / 60)}:{(watchedSeconds % 60).toString().padStart(2, '0')}</span>
                  <span>Remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
                </div>
                
                {/* Completion Button for Regular Videos */}
                {!hasCompleted && (
                  <div className="mt-4">
                    <Button
                      onClick={() => completeVideoMutation.mutate()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium touch-manipulation"
                      disabled={completeVideoMutation.isPending || timerSeconds < videoDuration}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {completeVideoMutation.isPending ? 'Processing...' : 
                       timerSeconds < videoDuration ? 
                       `Timer: ${videoDuration - timerSeconds}s remaining` : 
                       'Mark as Completed'}
                    </Button>
                    {timerSeconds < videoDuration && (
                      <div className="text-xs text-orange-600 text-center font-medium mt-2">
                        Timer must reach full duration to earn ₹{videoEarning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            

          </CardContent>
        </Card>








        {/* Video Description */}
        {video.description && (
          <Card className="mt-4 touch-manipulation">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">About this video</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{video.description}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
