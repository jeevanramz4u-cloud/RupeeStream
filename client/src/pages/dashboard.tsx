import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coins, 
  Clock, 
  PlayCircle, 
  Users, 
  TriangleAlert,
  Wallet,
  Share,
  Headphones,
  CheckCircle,
  Copy,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentActivity] = useState([
    { description: "Earned ₹12.50 from video", time: "2 hours ago" },
    { description: "Referral bonus ₹49", time: "1 day ago" },
  ]);

  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
    queryFn: () => fetch("/api/videos?limit=3").then(res => res.json()),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const shareReferral = () => {
    if (user?.referralCode) {
      const text = `Join EarnPay and start earning money by watching videos! Use my referral code: ${user.referralCode}`;
      if (navigator.share) {
        navigator.share({ text });
      } else {
        navigator.clipboard.writeText(text);
        toast({
          title: "Copied!",
          description: "Referral message copied to clipboard",
        });
      }
    }
  };

  const targetHours = 8;
  const watchedHours = stats?.dailyWatchTime ? stats.dailyWatchTime / 60 : 0;
  const progressPercentage = Math.min((watchedHours / targetHours) * 100, 100);
  const remainingHours = Math.max(targetHours - watchedHours, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats?.todayEarnings || '0.00'}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Coins className="text-secondary w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Watch Time Today</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(watchedHours)}h {Math.floor((watchedHours % 1) * 60)}m</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-primary w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">{Math.floor(watchedHours)}/{targetHours} hours</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos Watched</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <PlayCircle className="text-accent w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">+0 from yesterday</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Referral Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">0 successful referrals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                My Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{user?.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Date of Birth:</span>
                      <span className="text-sm font-medium">
                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Address</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">{user?.address || 'Not provided'}</p>
                        <p className="text-gray-600">{user?.city || ''}{user?.city && user?.state ? ', ' : ''}{user?.state || ''}</p>
                        {user?.pincode && <p className="text-gray-600">PIN: {user.pincode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Bank Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Account Holder:</span>
                      <span className="text-sm font-medium">{user?.accountHolderName || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Account Number:</span>
                      <span className="text-sm font-medium">
                        {user?.accountNumber ? `****${user.accountNumber.slice(-4)}` : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">IFSC Code:</span>
                      <span className="text-sm font-medium">{user?.ifscCode || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="text-sm font-medium">{user?.bankName || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Government ID Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Government ID</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ID Type:</span>
                      <span className="text-sm font-medium">{user?.governmentIdType || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ID Number:</span>
                      <span className="text-sm font-medium">
                        {user?.governmentIdNumber ? `****${user.governmentIdNumber.slice(-4)}` : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Verification:</span>
                      <span className={`text-sm font-medium ${
                        user?.verificationStatus === 'verified' ? 'text-green-600' : 
                        user?.verificationStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {user?.verificationStatus === 'verified' ? 'Verified' :
                         user?.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Account Status:</span>
                      <span className={`text-sm font-medium ${
                        user?.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user?.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Referral Code:</span>
                      <span className="text-sm font-medium">{user?.referralCode || 'Not available'}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Member Since:</span>
                      <span className="text-sm font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Current Balance:</span>
                      <span className="text-sm font-medium text-green-600">₹{user?.balance || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Target Alert */}
        {remainingHours > 0 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <TriangleAlert className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <strong>Daily Target Reminder:</strong> You need to watch {remainingHours.toFixed(1)} more hours today to avoid account suspension. Keep earning!
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Available Videos</CardTitle>
                  <select className="text-sm border-gray-300 rounded-lg">
                    <option>All Categories</option>
                    <option>Entertainment</option>
                    <option>Education</option>
                    <option>Technology</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    <a href="/videos">Load More Videos</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
                <Button 
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  onClick={shareReferral}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Referral Link
                </Button>
                <Button className="w-full bg-secondary text-white hover:bg-secondary/90">
                  <Headphones className="w-4 h-4 mr-2" />
                  <a href="/support">Contact Support</a>
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span className="flex items-center text-sm text-secondary font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {user?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bank Details</span>
                  <span className="flex items-center text-sm text-secondary font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {user?.bankDetails ? 'Added' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Payout</span>
                  <span className="text-sm font-medium text-gray-900">Tuesday</span>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">Earn ₹49 per Referral!</h3>
                <p className="text-sm text-purple-100 mb-4">Share your referral code and earn when friends join</p>
                <div className="bg-white/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{user?.referralCode || 'EP-LOADING'}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:text-purple-100 p-1"
                      onClick={copyReferralCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full bg-white text-purple-600 hover:bg-purple-50"
                  onClick={shareReferral}
                >
                  Share Now
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Coins className="text-secondary w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
