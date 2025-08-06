import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Calendar, Coins, Video, Users, Clock, Info, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function EarningsHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ["/api/earnings"],
    enabled: !!user,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/payouts"],
    enabled: !!user,
  });

  // Calculate next payout date (every Tuesday)
  const getNextTuesday = () => {
    const now = new Date();
    const nextTuesday = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilTuesday = dayOfWeek === 2 ? 7 : (2 - dayOfWeek + 7) % 7; // Tuesday is day 2
    
    if (daysUntilTuesday === 0) {
      // Today is Tuesday, check if it's past processing time (assume 2 PM)
      const processingHour = 14; // 2 PM
      if (now.getHours() >= processingHour) {
        nextTuesday.setDate(now.getDate() + 7);
      }
    } else {
      nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    }
    
    return nextTuesday.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const nextPayoutDate = getNextTuesday();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
  const videoEarnings = (earnings as any[]).filter((e: any) => e.type === 'video');
  const referralEarnings = (earnings as any[]).filter((e: any) => e.type === 'referral');
  
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{(stats as any)?.totalEarnings || 0}</p>
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
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{(stats as any)?.todayEarnings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Next Payout</p>
                  <p className="text-sm font-bold text-blue-900">{nextPayoutDate}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Info className="w-3 h-3 mr-1" />
                    Weekly on Tuesdays
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="touch-manipulation mb-8">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(payouts as any[]).length === 0 ? (
              <div className="text-center py-6">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No payout requests yet</p>
                <p className="text-xs text-gray-400">Request your first payout when ready!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(payouts as any[]).map((payout: any) => (
                  <div key={payout.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          Payout Request
                        </p>
                        <Badge 
                          variant={payout.status === 'completed' ? 'default' : 
                                 payout.status === 'failed' || payout.status === 'declined' ? 'destructive' : 
                                 payout.status === 'processing' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{payout.amount}
                      </p>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Requested:</span>
                        <span className="font-mono">{formatDate(payout.requested_at || payout.requestedAt)}</span>
                      </div>
                      
                      {payout.processed_at || payout.processedAt ? (
                        <div className="flex items-center justify-between">
                          <span>Processed:</span>
                          <span className="font-mono text-green-600">{formatDate(payout.processed_at || payout.processedAt)}</span>
                        </div>
                      ) : payout.status === 'pending' ? (
                        <div className="flex items-center justify-between">
                          <span>Expected:</span>
                          <span className="font-mono text-blue-600">{nextPayoutDate}</span>
                        </div>
                      ) : null}
                      
                      {payout.reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                          <p className="text-xs"><strong>Reason:</strong> {payout.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings List */}
        <Card className="touch-manipulation">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              All Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(earnings as any[]).length === 0 ? (
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
                {(earnings as any[]).map((earning: any) => (
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