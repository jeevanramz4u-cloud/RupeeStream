import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  Info,
  Target,
  Award,
  Activity,
  PiggyBank,
  ArrowUpRight,
  Download
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

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["/api/earnings"],
    enabled: isAuthenticated && !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: isAuthenticated && !!user,
  });

  const { 
    data: payouts, 
    isLoading: isPayoutsLoading, 
    error: payoutsError,
    refetch: refetchPayouts 
  } = useQuery({
    queryKey: ["/api/payouts"],
    enabled: isAuthenticated && !!user,
    retry: 2,
    staleTime: 30000,
  });

  const createPayoutMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest("POST", "/api/payouts", { amount }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });
      setIsPayoutDialogOpen(false);
      setPayoutAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payout request",
        variant: "destructive",
      });
    },
  });

  // Calculate next payout date (next Tuesday)
  const getNextPayoutDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    return nextTuesday.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const nextPayoutDate = getNextPayoutDate();

  // Calculate watch progress
  const watchedHours = (user as any)?.todayWatchTime || 0;
  const targetHours = 8;
  const progressPercentage = Math.min((watchedHours / targetHours) * 100, 100);
  const remainingHours = Math.max(targetHours - watchedHours, 0);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your earnings.</p>
        </div>
      </div>
    );
  }

  const handlePayoutSubmit = () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
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
      case 'task_completion':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'referral_bonus':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'signup_bonus':
        return <Award className="w-4 h-4 text-green-600" />;
      case 'hourly_bonus':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'video':
        return <Coins className="w-4 h-4 text-accent" />;
      case 'referral':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <PiggyBank className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">Professional Earnings</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-medium">Comprehensive income tracking and secure payout management</p>
            </div>
          </div>
        </div>

        {/* Signup Bonus Alert */}
        {!(user as any)?.hasSeenSignupBonus && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Welcome Bonus:</strong> New users receive ₹1,000 automatically credited to their account. 
              Check your earnings history below to see all credited amounts.
            </AlertDescription>
          </Alert>
        )}

        {/* Daily Target Alert */}
        {remainingHours > 0 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <TriangleAlert className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <strong>Daily Target Warning:</strong> You need to watch {remainingHours.toFixed(1)} more hours today to avoid account suspension. Current progress: {watchedHours.toFixed(1)}/{targetHours} hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Modern Professional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white md:bg-gradient-to-br md:from-green-50 md:to-emerald-50 md:text-gray-900 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 md:from-green-500/5 md:to-emerald-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-100 md:text-green-700 mb-1">Current Balance</p>
                  <p className="text-3xl font-black text-white md:text-gray-900">₹{(user as any)?.balance || '0.00'}</p>
                  <p className="text-xs text-green-100 md:text-green-600 font-medium">Available for withdrawal</p>
                </div>
                <div className="w-14 h-14 bg-white/20 md:bg-gradient-to-br md:from-green-100 md:to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="text-white md:text-green-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 md:from-green-500 md:to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Today's Income</p>
                  <p className="text-3xl font-black text-gray-900">₹{(stats as any)?.todayEarnings || '35.00'}</p>
                  <p className="text-xs text-blue-600 font-medium">Current session earnings</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Coins className="text-blue-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-1">Daily Progress</p>
                  <p className="text-3xl font-black text-gray-900">{watchedHours.toFixed(1)}/{targetHours}h</p>
                  <p className="text-xs text-purple-600 font-medium">Professional target tracking</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="text-purple-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-1">Completion Rate</p>
                  <p className="text-3xl font-black text-gray-900">{progressPercentage.toFixed(0)}%</p>
                  <p className="text-xs text-orange-600 font-medium">Today's achievement</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-orange-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Payout Action Card */}
        <Card className="mb-8 border border-indigo-100 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
              <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
              Professional Payout Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                  <p className="font-semibold text-gray-900">Next Processing Date</p>
                </div>
                <p className="text-2xl font-black text-indigo-600">{nextPayoutDate}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Payouts are processed every Tuesday at 12:00 PM IST. Submit requests by Monday to be included in the next batch.
                </p>
              </div>
              
              <div className="space-y-4">
                <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Request Professional Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black text-gray-900">Request Secure Payout</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <p className="text-sm font-semibold text-green-800 mb-1">Available Balance</p>
                        <p className="text-2xl font-black text-green-900">₹{(user as any)?.balance || '0.00'}</p>
                        <p className="text-xs text-green-700 mt-1">
                          Next processing: {nextPayoutDate}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="amount" className="font-semibold text-gray-900">Withdrawal Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount to withdraw"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          min="1"
                          max={(user as any)?.balance || "0"}
                          step="0.01"
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Minimum: ₹1 • Maximum: ₹{(user as any)?.balance || '0.00'}
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsPayoutDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePayoutSubmit}
                          disabled={createPayoutMutation.isPending}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          {createPayoutMutation.isPending ? 'Processing...' : 'Submit Request'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="text-center">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Secure bank transfers • KYC verified accounts only • Processing within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Modern Earnings History */}
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                Earnings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Earnings Summary */}
              {earnings && (earnings as any[])?.length > 0 && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Task Earnings</span>
                    </div>
                    <p className="text-lg font-black text-green-600 mt-1">
                      ₹{(earnings as any[])?.filter(e => e.type === 'task_completion').reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">Referral Bonuses</span>
                    </div>
                    <p className="text-lg font-black text-purple-600 mt-1">
                      ₹{(earnings as any[])?.filter(e => e.type === 'referral_bonus').reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">Bonus Earnings</span>
                    </div>
                    <p className="text-lg font-black text-blue-600 mt-1">
                      ₹{(earnings as any[])?.filter(e => e.type === 'hourly_bonus' || e.type === 'signup_bonus').reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              
              {!earnings || (earnings as any[])?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Start Your Professional Journey</p>
                  <p className="text-sm text-gray-600">Begin watching videos to generate earnings and build your income stream!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(earnings as any[])?.slice(0, 10).map((earning: any) => (
                    <div key={earning.id} className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 p-4 rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            earning.type === 'referral_bonus' 
                              ? 'bg-gradient-to-br from-purple-100 to-violet-100' 
                              : earning.type === 'signup_bonus'
                              ? 'bg-gradient-to-br from-yellow-100 to-amber-100'
                              : 'bg-gradient-to-br from-green-100 to-emerald-100'
                          }`}>
                            {getEarningIcon(earning.type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {earning.description || `${earning.type} earning`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatDate(earning.createdAt)}
                            </p>
                            {earning.type === 'referral_bonus' && (
                              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                                Referral Reward
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black flex items-center ${
                            earning.type === 'referral_bonus' ? 'text-purple-600' :
                            earning.type === 'signup_bonus' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            ₹{earning.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(earnings as any[])?.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                        View Complete History
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modern Payout History */}
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <Download className="w-6 h-6 mr-3 text-blue-600" />
                Payout History
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerPayoutsRefetch}
                disabled={isPayoutsLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {isPayoutsLoading ? "Loading..." : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent>
              {isPayoutsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-600 mt-3 font-medium">Loading payout history...</p>
                </div>
              ) : payoutsError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-lg font-semibold text-red-600 mb-2">Error Loading Payouts</p>
                  <p className="text-sm text-gray-600">Please refresh the page or contact support</p>
                </div>
              ) : (payouts as any[])?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">No Payouts Yet</p>
                  <p className="text-sm text-gray-600">Request your first professional payout when you're ready!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(payouts as any[])?.map((payout: any) => (
                    <div key={payout.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Download className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Professional Payout
                            </p>
                            <Badge 
                              variant={payout.status === 'completed' ? 'default' : 
                                     payout.status === 'failed' || payout.status === 'declined' ? 'destructive' : 
                                     payout.status === 'processing' ? 'secondary' : 'outline'}
                              className="text-xs mt-1"
                            >
                              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-blue-600">
                            ₹{payout.amount}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Requested:</span>
                          <span className="font-mono">{formatDate(payout.requested_at || payout.requestedAt)}</span>
                        </div>
                        
                        {payout.processed_at || payout.processedAt ? (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Processed:</span>
                            <span className="font-mono text-green-600">{formatDate(payout.processed_at || payout.processedAt)}</span>
                          </div>
                        ) : payout.status === 'pending' ? (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Expected:</span>
                            <span className="font-mono text-blue-600">{nextPayoutDate}</span>
                          </div>
                        ) : null}
                        
                        {payout.reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            <p className="text-xs font-medium"><strong>Issue Details:</strong> {payout.reason}</p>
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
      
      <Footer />
    </div>
  );
}