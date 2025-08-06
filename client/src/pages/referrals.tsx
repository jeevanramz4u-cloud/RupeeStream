import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
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
  User
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
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Referral Program</h1>
          <p className="text-gray-600">
            Earn ₹49 for every friend you refer who gets verified on our platform. 
            Share your referral code and start earning!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{(referrals as any[] || []).length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{verifiedReferrals.length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-secondary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Referral Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Gift className="text-accent w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Tools */}
          <div className="space-y-6">
            {/* Referral Code Card */}
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Your Referral Code</h3>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-xl font-mono font-bold">
                      {(user as any)?.referralCode || 'Loading...'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={copyReferralCode}
                    >
                      {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-purple-100 text-sm mb-4">
                  Share this code with friends. When they sign up and get verified, you earn ₹49!
                </p>

                <div className="flex space-x-2">
                  <Button 
                    className="flex-1 bg-white text-purple-600 hover:bg-purple-50"
                    onClick={shareReferral}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={copyReferralCode}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    value={referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyReferralLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Direct link that automatically applies your referral code when someone signs up.
                </p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Share Your Code</h4>
                    <p className="text-sm text-gray-600">
                      Share your referral code or link with friends and family.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">They Sign Up</h4>
                    <p className="text-sm text-gray-600">
                      Your friends use your code to create an account and upload verification documents.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Verified & Earn</h4>
                    <p className="text-sm text-gray-600">
                      Once their account is verified by our admin, you receive ₹49 instantly!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Loading referrals...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Failed to load referrals</p>
                </div>
              ) : !referrals || (referrals as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start sharing your referral code to earn money!
                  </p>
                  <Button onClick={shareReferral}>
                    <Share className="w-4 h-4 mr-2" />
                    Share Now
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
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isVerified ? 'bg-green-100' : 'bg-gray-300'
                          }`}>
                            <User className={`w-5 h-5 ${
                              isVerified ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {referredUser?.firstName} {referredUser?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Signed up {formatDate(referral.createdAt)}
                            </p>
                            {referredUser?.email && (
                              <p className="text-xs text-gray-500">
                                {referredUser.email}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {referral.isEarningCredited ? (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Earned ₹49
                            </Badge>
                          ) : isVerified && kycCompleted ? (
                            <Badge className="bg-blue-600 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : isVerified ? (
                            <Badge className="bg-yellow-600 text-white">
                              <Clock className="w-3 h-3 mr-1" />
                              KYC Pending
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Verification
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

        {/* Terms & Conditions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Referral Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• You earn ₹49 for each successfully verified referral.</p>
            <p>• Referred users must complete account verification with government ID and bank details.</p>
            <p>• Referral bonuses are credited automatically once verification is approved by admin.</p>
            <p>• Self-referrals and fake accounts are strictly prohibited and may result in account suspension.</p>
            <p>• EarnPay reserves the right to modify referral rewards at any time.</p>
            <p>• Referral earnings are subject to the same payout schedule as video earnings (weekly on Tuesdays).</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
