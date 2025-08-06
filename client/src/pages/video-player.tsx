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
      setWatchedSeconds(progress.watchedSeconds || 0);
      setHasCompleted(progress.isCompleted || false);
    }
  }, [progress]);

  useEffect(() => {
    // Set required watch time based on video duration (minimum 80% of video duration)
    if (video && video.duration > 0) {
      setRequiredWatchTime(Math.floor(video.duration * 0.8));
    }
  }, [video]);

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
  
  // Progress accessors
  const hasEarnings = progress?.isEarningCredited || false;

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
        {/* Instructions for YouTube videos - Top */}
        {isYouTubeVideo && (
          <Card className="mb-3 touch-manipulation">
            <CardContent className="p-3 bg-blue-50">
              <div className="text-center">
                <p className="text-xs text-blue-800 mb-1">
                  <strong>How to earn:</strong> Open YouTube → Watch video → Return & complete
                </p>
                <p className="text-xs text-blue-600">
                  Status: {hasCompleted ? '✅ Completed' : '⏳ Pending completion'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earning Status - Before Player */}
        {canEarn ? (
          <Alert className="mb-3 border-orange-200 bg-orange-50 touch-manipulation">
            <Coins className="h-3 w-3 text-orange-600" />
            <AlertDescription className="text-orange-700 text-xs">
              <strong>Earn ₹{videoEarning}</strong> - Watch completely without skipping
            </AlertDescription>
          </Alert>
        ) : hasCompleted ? (
          <Alert className="mb-3 border-green-200 bg-green-50 touch-manipulation">
            <Coins className="h-3 w-3 text-green-600" />
            <AlertDescription className="text-green-700 text-xs">
              <strong>Completed!</strong> You earned ₹{videoEarning}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-3 touch-manipulation">
            <Info className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Already earned from this video
            </AlertDescription>
          </Alert>
        )}

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
                        // Add parameters for better embedding
                        embedUrl += '?autoplay=0&controls=1&modestbranding=1&rel=0&playsinline=1';
                        return embedUrl;
                      })()}
                      title={videoTitle}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => {
                        // Start tracking when video loads
                        if (!youtubeWatchStartTime) {
                          setYoutubeWatchStartTime(new Date());
                          setIsWatchingOnYoutube(true);
                        }
                      }}
                    />
                    
                    {/* Fallback controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="text-white text-xs sm:text-sm">
                          {isWatchingOnYoutube && youtubeWatchStartTime && (
                            <div className="flex items-center gap-2">
                              <span>⏱️ {Math.floor(currentWatchTime / 60)}:{(currentWatchTime % 60).toString().padStart(2, '0')}</span>
                              {currentWatchTime >= requiredWatchTime && (
                                <span className="text-green-300">✓ Ready!</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => window.open(videoUrl, '_blank')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Open in YouTube
                          </Button>
                          
                          {!hasCompleted && currentWatchTime >= requiredWatchTime && (
                            <Button
                              size="sm"
                              onClick={() => completeVideoMutation.mutate()}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              disabled={completeVideoMutation.isPending}
                            >
                              <Coins className="w-3 h-3 mr-1" />
                              {completeVideoMutation.isPending ? 'Processing...' : 'Complete'}
                            </Button>
                          )}
                          
                          {hasCompleted && (
                            <div className="bg-green-800 text-green-200 px-2 py-1 rounded text-xs flex items-center">
                              <Coins className="w-3 h-3 mr-1" />
                              Completed!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular video player for direct video files
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-t-lg object-contain"
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
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
