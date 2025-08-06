import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Calendar, Coins, Video, Users } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function EarningsHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ["/api/earnings"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 safe-area-padding">
        <Header />
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Group earnings by type for summary
  const videoEarnings = earnings.filter((e: any) => e.type === 'video');
  const referralEarnings = earnings.filter((e: any) => e.type === 'referral');
  
  const totalVideoEarnings = videoEarnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
  const totalReferralEarnings = referralEarnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/dashboard")}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings History</h1>
            <p className="text-sm sm:text-base text-gray-600">Track all your earnings from videos and referrals</p>
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats?.totalEarnings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Video Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalVideoEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Referral Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalReferralEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats?.todayEarnings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings List */}
        <Card className="touch-manipulation">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">All Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No earnings yet</p>
                <p className="text-sm text-gray-400">Start watching videos to earn money!</p>
                <Button 
                  onClick={() => setLocation("/videos")} 
                  className="mt-4"
                >
                  Browse Videos
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {earnings.map((earning: any) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {earning.type === 'video' ? (
                          <Video className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {earning.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={earning.type === 'video' ? 'default' : 'secondary'}>
                            {earning.type === 'video' ? 'Video' : 'Referral'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(earning.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-green-600">
                        +₹{parseFloat(earning.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}