import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Video, Star } from "lucide-react";
import { useState } from "react";

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  const filteredVideos = (videos as any[]).filter((video: any) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set((videos as any[]).map((video: any) => video.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">Professional Content Library</h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Premium video content designed to maximize your professional earnings potential</p>
            </div>
          </div>
        </div>

        {/* Professional Earnings Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Star className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Premium Earnings:</strong> Complete video viewing generates professional income. Videos must be watched entirely without skipping for full payment credit.
          </AlertDescription>
        </Alert>

        {/* Enhanced Filters */}
        <Card className="mb-6 sm:mb-8 border border-gray-100 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-xl font-black text-gray-900 flex items-center tracking-tight">
              <Search className="w-6 h-6 mr-3 text-purple-600" />
              Content Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search professional video content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-sm border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🎯 All Categories</SelectItem>
                    {categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        📂 {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="bg-gray-300 aspect-video rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No videos found matching your criteria.</p>
            </div>
          ) : (
            filteredVideos.map((video: any) => (
              <VideoCard key={video.id} video={video} showFullCard />
            ))
          )}
        </div>

        {/* Load More */}
        {!isLoading && filteredVideos.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">Showing {filteredVideos.length} videos</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
