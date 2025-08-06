import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Clock, Eye, Play } from "lucide-react";
import { Link } from "wouter";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration: number;
    views: number;
    earning: string;
    category?: string;
  };
  showFullCard?: boolean;
}

export default function VideoCard({ video, showFullCard = false }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (showFullCard) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center relative overflow-hidden">
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Play className="w-12 h-12 mb-2 opacity-50 mx-auto" />
                  <p className="text-sm opacity-75">Video Thumbnail</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Play className="w-6 h-6 mr-2" />
                  Play Video
                </Button>
              </div>
            </div>
            
            {video.category && (
              <Badge className="absolute top-3 left-3 bg-primary text-white">
                {video.category}
              </Badge>
            )}
            
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
            {video.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatViews(video.views)} views
                </span>
              </div>
              
              <div className="flex items-center space-x-1 bg-accent/10 px-2 py-1 rounded-full">
                <Coins className="text-accent w-3 h-3" />
                <span className="text-xs font-semibold text-accent">₹{video.earning}</span>
              </div>
            </div>
            
            <Link href={`/video/${video.id}`}>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Play className="w-4 h-4 mr-2" />
                Watch & Earn
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact card for dashboard
  return (
    <Link href={`/video/${video.id}`}>
      <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-12 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
            {video.thumbnailUrl ? (
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Play className="text-white w-4 h-4" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
            <Play className="w-2 h-2" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{video.title}</h3>
          {video.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{video.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(video.duration)}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {formatViews(video.views)} views
              </span>
            </div>
            
            <div className="flex items-center space-x-1 bg-accent/10 px-2 py-1 rounded-full">
              <Coins className="text-accent w-3 h-3" />
              <span className="text-xs font-semibold text-accent">₹{video.earning}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
