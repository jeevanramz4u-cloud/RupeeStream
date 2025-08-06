import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coins, 
  Clock, 
  Wallet, 
  TrendingUp,
  Calendar,
  TriangleAlert
} from "lucide-react";
import { useEffect } from "react";

export default function Earnings() {
  const { user } = useAuth();

  const { data: earnings = [] } = useQuery({
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

  // Check if user needs account suspension for not meeting daily target
  useEffect(() => {
    if (stats && (stats as any).dailyWatchTime < 480) { // 8 hours = 480 minutes
      // Here you could implement logic to suspend accounts
      // For now, just show a warning
    }
  }, [stats]);

  const targetHours = 8;
  const watchedHours = (stats as any)?.dailyWatchTime ? (stats as any).dailyWatchTime / 60 : 0;
  const progressPercentage = Math.min((watchedHours / targetHours) * 100, 100);
  const remainingHours = Math.max(targetHours - watchedHours, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEarningIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Coins className="w-4 h-4 text-accent" />;
      case 'referral':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your earnings, watch time, and payout history.</p>
        </div>

        {/* Daily Target Alert */}
        {remainingHours > 0 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <TriangleAlert className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <strong>Daily Target Warning:</strong> You need to watch {remainingHours.toFixed(1)} more hours today to avoid account suspension. Current progress: {watchedHours.toFixed(1)}/{targetHours} hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(user as any)?.balance || '0.00'}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Wallet className="text-secondary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(stats as any)?.todayEarnings || '0.00'}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Coins className="text-accent w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(watchedHours)}h {Math.floor((watchedHours % 1) * 60)}m</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-primary w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">{Math.floor(watchedHours)}/{targetHours} hours (Target: 8h daily)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Payout</p>
                  <p className="text-2xl font-bold text-gray-900">Tuesday</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full" size="sm">
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Earnings History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {(earnings as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings yet</p>
                  <p className="text-sm text-gray-400">Start watching videos to earn money!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(earnings as any[]).slice(0, 10).map((earning: any) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getEarningIcon(earning.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {earning.description || `${earning.type} earning`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(earning.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-secondary">
                        +₹{earning.amount}
                      </span>
                    </div>
                  ))}
                  
                  {(earnings as any[]).length > 10 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        View All Earnings
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {(payouts as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payouts yet</p>
                  <p className="text-sm text-gray-400">Request your first payout when ready!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(payouts as any[]).map((payout: any) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payout Request
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(payout.requestedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{payout.amount}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {payout.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Target Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Daily Target Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> You must watch videos for a minimum of 8 hours daily to maintain your account in good standing. 
                Accounts that don't meet this requirement may be suspended. Current target progress: {Math.floor(watchedHours)}h {Math.floor((watchedHours % 1) * 60)}m / 8h
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
