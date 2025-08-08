import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, 
  Clock, 
  Wallet, 
  TrendingUp,
  Calendar,
  TriangleAlert,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function Earnings() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  // Debug logging
  console.log("Earnings page - Auth status:", { user, authLoading, isAuthenticated });

  // Force refetch when user becomes available
  useEffect(() => {
    if (user && !authLoading) {
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      console.log("Invalidating payouts query because user is loaded");
    }
  }, [user, authLoading, queryClient]);

  // Manual trigger for payouts query
  const triggerPayoutsRefetch = () => {
    console.log("Manual payouts refetch triggered");
    queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
    refetchPayouts();
  };

  const { data: earnings = [] } = useQuery({
    queryKey: ["/api/earnings"],
    enabled: !!user,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  const { data: payouts = [], isLoading: isPayoutsLoading, error: payoutsError, refetch: refetchPayouts } = useQuery({
    queryKey: ["/api/payouts"],
    enabled: !!user && !authLoading,
    retry: 3,
  });

  // Debug logging for payouts
  console.log("Payouts query status:", { payouts, isPayoutsLoading, payoutsError, enabled: !!user && !authLoading, userExists: !!user });

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

  // Calculate next Tuesday for payout
  const getNextTuesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilTuesday = dayOfWeek <= 2 ? (2 - dayOfWeek) : (9 - dayOfWeek); // 2 = Tuesday
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    
    return nextTuesday.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
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

  // Payout request mutation
  const createPayoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/payouts", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully. You'll receive payment on Tuesday.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      setIsPayoutDialogOpen(false);
      setPayoutAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Payout Request Failed",
        description: error.message || "Failed to create payout request. Please check your bank details and verification status.",
        variant: "destructive",
      });
    },
  });

  const handlePayoutSubmit = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payout amount.",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat((user as any)?.balance || "0");
    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Payout amount cannot exceed your current balance.",
        variant: "destructive",
      });
      return;
    }

    createPayoutMutation.mutate(amount);
  };

  const getEarningIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Coins className="w-4 h-4 text-accent" />;
      case 'referral':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'signup_bonus':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'hourly_bonus':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">Earnings Dashboard</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Track your professional earnings, watch time, and secure payout history.</p>
        </div>

        {/* Signup Bonus Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Welcome Bonus:</strong> New users receive ₹1,000 automatically credited to their account. 
            Check your earnings history below to see all credited amounts.
          </AlertDescription>
        </Alert>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white md:bg-white md:text-gray-900 touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100 md:text-gray-600">Total Balance</p>
                  <p className="text-2xl sm:text-3xl md:text-2xl font-bold text-white md:text-gray-900">₹{(user as any)?.balance || '0.00'}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 md:bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Wallet className="text-white md:text-secondary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{(stats as any)?.todayEarnings || '0.00'}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Coins className="text-accent w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Watch Time</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{Math.floor(watchedHours)}h {Math.floor((watchedHours % 1) * 60)}m</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">{Math.floor(watchedHours)}/{targetHours} hours (Target: 8h daily)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Next Payout Date</p>
                  <p className="text-base sm:text-lg font-bold text-blue-900">{nextPayoutDate}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Payouts processed every Tuesday
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="sm">
                      Request Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Payout</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Current Balance:</strong> ₹{(user as any)?.balance || '0.00'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Next payout: {nextPayoutDate}. Make sure your bank details are complete and your account is verified.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="amount">Payout Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount to withdraw"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          min="1"
                          max={(user as any)?.balance || "0"}
                          step="0.01"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsPayoutDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePayoutSubmit}
                          disabled={createPayoutMutation.isPending}
                        >
                          {createPayoutMutation.isPending ? 'Processing...' : 'Request Payout'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Payout History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerPayoutsRefetch}
                disabled={isPayoutsLoading}
              >
                {isPayoutsLoading ? "Loading..." : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent>
              {isPayoutsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-500 mt-2">Loading payouts...</p>
                </div>
              ) : payoutsError ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500">Error loading payouts</p>
                  <p className="text-sm text-gray-400">Please try refreshing the page</p>
                </div>
              ) : (payouts as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payouts yet</p>
                  <p className="text-sm text-gray-400">Request your first payout when ready!</p>
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
