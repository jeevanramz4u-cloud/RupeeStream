import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Available Videos</h1>
          <p className="text-sm sm:text-base text-gray-600">Watch videos completely to earn money. Remember, you cannot skip or fast-forward!</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8 touch-manipulation">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Filter Videos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <Input
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
