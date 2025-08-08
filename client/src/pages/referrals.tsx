import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Copy, 
  Share, 
  Gift, 
  UserPlus,
  ExternalLink,
  CheckCircle,
  Clock,
  User,
  Coins,
  TrendingUp,
  Star,
  Award,
  Link as LinkIcon,
  Smartphone,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: referrals = [], error, isLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user,
    retry: false,
  });

  const referralLink = `${window.location.origin}/signup?ref=${(user as any)?.referralCode}`;
  const referralText = `Join EarnPay and start earning money by watching videos! Use my referral code: ${(user as any)?.referralCode || ''}\n\nSign up here: ${referralLink}`;

  const copyReferralCode = async () => {
    if ((user as any)?.referralCode) {
      try {
        await navigator.clipboard.writeText((user as any).referralCode);
        setCopySuccess(true);
        toast({
          title: "Copied!",
          description: "Referral code copied to clipboard",
        });
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy referral code",
          variant: "destructive",
        });
      }
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join EarnPay - Earn Money Watching Videos",
          text: referralText,
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralText);
        toast({
          title: "Copied!",
          description: "Referral message copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const verifiedReferrals = (referrals as any[] || []).filter((ref: any) => ref.isEarningCredited);
  const pendingReferrals = (referrals as any[] || []).filter((ref: any) => !ref.isEarningCredited);
  const totalEarnings = verifiedReferrals.length * 49;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight tracking-tight">Professional Referral Program</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-medium">
            Build your business network and earn ₹49 for every verified professional you refer to our platform
          </p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Network Size</p>
                  <p className="text-3xl font-black text-gray-900">{(referrals as any[] || []).length}</p>
                  <p className="text-xs text-blue-600 font-medium">Total professionals referred</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-blue-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">Verified Partners</p>
                  <p className="text-3xl font-black text-gray-900">{verifiedReferrals.length}</p>
                  <p className="text-xs text-green-600 font-medium">KYC completed members</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-green-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-1">Total Earnings</p>
                  <p className="text-3xl font-black text-gray-900">₹{totalEarnings}</p>
                  <p className="text-xs text-purple-600 font-medium">From referral bonuses</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Coins className="text-purple-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Modern Referral Tools */}
          <div className="space-y-6">
            {/* Enhanced Referral Code Card */}
            <Card className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white shadow-2xl border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-600/20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <CardContent className="relative pt-6 pb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Your Professional Code</h3>
                    <p className="text-purple-100 text-sm font-medium">Share and earn with every referral</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <code className="text-2xl font-mono font-black tracking-wider text-white">
                      {(user as any)?.referralCode || 'Loading...'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 transition-colors"
                      onClick={copyReferralCode}
                    >
                      {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <p className="text-purple-100 text-sm mb-6 leading-relaxed">
                  Share this exclusive code with business professionals. Earn ₹49 for each verified member who joins!
                </p>

                <div className="flex space-x-3">
                  <Button 
                    className="flex-1 bg-white text-purple-700 hover:bg-gray-50 font-semibold shadow-lg"
                    onClick={shareReferral}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Code
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    onClick={copyReferralCode}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modern Referral Link Card */}
            <Card className="border border-gray-100 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                  <LinkIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Professional Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <Input 
                    value={referralLink}
                    readOnly
                    className="flex-1 font-mono text-sm bg-gray-50 border-gray-200"
                  />
                  <Button onClick={copyReferralLink} className="bg-blue-600 hover:bg-blue-700">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Direct registration link with your referral code automatically applied for seamless onboarding.
                </p>
              </CardContent>
            </Card>

            {/* Modern How It Works */}
            <Card className="border border-gray-100 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Professional Referral Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Network Expansion</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Share your professional code with qualified individuals in your business network.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Registration & Verification</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Referred professionals complete account setup and submit KYC documentation for verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Instant Bonus Credit</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Upon admin approval of their verification, ₹49 is automatically credited to your earnings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Referral History */}
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                Professional Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading your network data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-semibold">Failed to load referral data</p>
                  <p className="text-gray-500 text-sm mt-2">Please refresh the page to try again</p>
                </div>
              ) : !referrals || (referrals as any[]).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserPlus className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Professional Network</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Start expanding your business network and earning ₹49 for each verified professional you refer.
                  </p>
                  <Button onClick={shareReferral} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                    <Share className="w-4 h-4 mr-2" />
                    Share Your Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(referrals as any[] || []).map((referral: any) => {
                    const referredUser = referral.referredUser;
                    const isVerified = referredUser?.verificationStatus === 'verified';
                    const kycCompleted = referredUser?.kycStatus === 'approved';
                    
                    return (
                      <div 
                        key={referral.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            referral.isEarningCredited 
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                              : isVerified && kycCompleted
                              ? 'bg-gradient-to-br from-blue-100 to-indigo-100'
                              : isVerified
                              ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200'
                          }`}>
                            <User className={`w-6 h-6 ${
                              referral.isEarningCredited 
                                ? 'text-green-600' 
                                : isVerified && kycCompleted
                                ? 'text-blue-600'
                                : isVerified
                                ? 'text-yellow-600'
                                : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-base">
                              {referredUser?.firstName} {referredUser?.lastName}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              Joined {formatDate(referral.createdAt)}
                            </p>
                            {referredUser?.email && (
                              <p className="text-xs text-gray-500 font-mono">
                                {referredUser.email}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {referral.isEarningCredited ? (
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
                              <Coins className="w-3 h-3 mr-1" />
                              Earned ₹49
                            </Badge>
                          ) : isVerified && kycCompleted ? (
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : isVerified ? (
                            <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg">
                              <Clock className="w-3 h-3 mr-1" />
                              KYC Processing
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Registration Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Professional Terms & Conditions */}
        <Card className="mt-8 border border-gray-100 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
              <Star className="w-6 h-6 mr-3 text-yellow-600" />
              Professional Program Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">₹49 bonus</span> per successfully verified professional referral
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">KYC verification required</span> - government ID and banking details mandatory
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Automatic crediting</span> upon admin verification approval
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Fraud prevention</span> - self-referrals result in account suspension
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Weekly payouts</span> every Tuesday with regular earnings
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Program modifications</span> reserved by EarnPay management
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
