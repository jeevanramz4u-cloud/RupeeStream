import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Calendar, Coins, Video, Users, Clock, Wallet, CheckCircle } from "lucide-react";
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

  const { data: payouts = [] } = useQuery({
    queryKey: ["/api/payouts"],
    enabled: !!user,
  });

  // Calculate next payout date (every Tuesday)
  const getNextTuesday = () => {
    const now = new Date();
    const nextTuesday = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilTuesday = dayOfWeek === 2 ? 7 : (2 - dayOfWeek + 7) % 7;
    
    if (daysUntilTuesday === 0) {
      const processingHour = 14;
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
  const taskEarnings = (earnings as any[]).filter((e: any) => e.type === 'task');
  
  const totalVideoEarnings = videoEarnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
  const totalTaskEarnings = taskEarnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
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
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Task Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalTaskEarnings.toFixed(2)}</p>
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
                  <p className="text-lg font-bold text-blue-900">{nextPayoutDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="touch-manipulation mb-8">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {(payouts as any[]).length === 0 ? (
              <div className="text-center py-6">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No payout requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(payouts as any[]).map((payout: any) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payout Request</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payout.requestedAt || payout.requested_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {payout.processedAt || payout.processed_at ? (
                        <p className="text-xs text-green-600">
                          Processed: {format(new Date(payout.processedAt || payout.processed_at), 'MMM d, yyyy')}
                        </p>
                      ) : payout.status === 'pending' ? (
                        <p className="text-xs text-blue-600">Expected: {nextPayoutDate}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{payout.amount}</p>
                      <p className="text-xs text-gray-500 capitalize">{payout.status}</p>
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
            <CardTitle className="text-base sm:text-lg">All Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {(earnings as any[]).length === 0 ? (
              <div className="text-center py-8">
                <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No earnings yet</p>
                <p className="text-sm text-gray-400">Start completing tasks and watching videos to earn money!</p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => setLocation("/tasks")} 
                    className="flex-1"
                  >
                    Browse Tasks
                  </Button>
                  <Button 
                    onClick={() => setLocation("/videos")} 
                    variant="outline"
                    className="flex-1"
                  >
                    Watch Videos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(earnings as any[]).map((earning: any) => (
                  <div key={earning.id} className="p-3 sm:p-4 rounded-lg border bg-white">
                    {/* Mobile-first: Stack vertically on small screens */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      {/* Left section with icon and content */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {earning.type === 'video' ? (
                            <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          ) : earning.type === 'task' ? (
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          ) : (
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate pr-2">
                            {earning.description}
                          </p>
                          {/* Mobile: Stack badge and date vertically */}
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                            <Badge 
                              variant={earning.type === 'video' ? 'default' : earning.type === 'task' ? 'outline' : 'secondary'}
                              className={`text-xs w-fit ${earning.type === 'task' ? 'border-green-200 text-green-700 bg-green-50' : ''}`}
                            >
                              {earning.type === 'video' ? 'Video' : earning.type === 'task' ? 'Task' : 'Referral'}
                            </Badge>
                            <span className="text-xs text-gray-500 sm:ml-2">
                              {format(new Date(earning.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right section with amount - positioned differently on mobile */}
                      <div className="flex justify-end sm:justify-start">
                        <span className="text-base sm:text-lg font-semibold text-green-600">
                          +₹{parseFloat(earning.amount).toFixed(2)}
                        </span>
                      </div>
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