import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  Edit,
  Save,
  X,
  Shield,
  Play,
  Users,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
  Target,
  Award,
  Activity,
  Coins
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import React from "react";
import { useLocation } from "wouter";
import SuspensionAlert from "@/components/SuspensionAlert";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Check if user is suspended and redirect with forced refresh
  React.useEffect(() => {
    if ((user as any)?.status === 'suspended') {
      console.log('User is suspended, redirecting to /suspended page');
      setLocation('/suspended');
      // Force reload to clear any cached data
      window.location.href = '/suspended';
    }
  }, [user, setLocation]);

  const { data: stats } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  const targetHours = 8;
  const watchedHours = (stats as any)?.dailyWatchTime ? (stats as any).dailyWatchTime / 60 : 0;
  const progressPercentage = Math.min((watchedHours / targetHours) * 100, 100);
  const remainingHours = Math.max(targetHours - watchedHours, 0);

  const handleEditProfile = () => {
    setEditingUser({...(user as any)});
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">Welcome back, {(user as any)?.firstName}!</h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Your professional earnings overview</p>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Balance Banner */}
        <div className="md:hidden mb-6">
          <Link href="/earnings">
            <Card className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 touch-manipulation overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-semibold mb-1">Current Balance</p>
                    <p className="text-4xl font-black mb-2">₹{(user as any)?.balance || '0.00'}</p>
                    <p className="text-green-100 text-sm font-medium">Tap to view full earnings history</p>
                  </div>
                  <div className="w-18 h-18 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Modern Professional Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden" onClick={() => setLocation("/earnings")}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">Total Earnings</p>
                  <p className="text-3xl font-black text-gray-900">₹{(stats as any)?.totalEarnings || 0}</p>
                  <p className="text-xs text-green-600 font-medium">Lifetime accumulation</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Coins className="text-green-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardContent className="relative pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Today's Income</p>
                  <p className="text-3xl font-black text-gray-900">₹{(stats as any)?.todayEarnings || 0}</p>
                  <p className="text-xs text-blue-600 font-medium">Current session</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-blue-600 w-7 h-7" />
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
                  <p className="text-sm font-semibold text-purple-700 mb-1">Tasks Completed</p>
                  <p className="text-3xl font-black text-gray-900">{stats?.completedTasks || '0'}</p>
                  <p className="text-xs text-purple-600 font-medium">This month</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="text-purple-600 w-7 h-7" />
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
                  <p className="text-sm font-semibold text-orange-700 mb-1">Account Level</p>
                  <p className="text-2xl font-black text-gray-900">
                    {(user as any)?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">Professional status</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-orange-600 w-7 h-7" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Status Alert - Highest Priority */}
        {user && (user as any).kycStatus === 'pending' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base text-red-800">
                  Complete KYC Verification Required
                </p>
                <p className="text-sm text-red-700">
                  You must complete KYC verification with ₹99 processing fee to unlock payouts and maintain account status.
                </p>
              </div>
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                <Link href="/kyc">Complete KYC Now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user && (user as any).kycStatus === 'submitted' && !(user as any).kycFeePaid && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base text-blue-800">
                  KYC Payment Pending
                </p>
                <p className="text-sm text-blue-700">
                  Your documents have been submitted. Please pay the ₹99 processing fee to complete verification.
                </p>
              </div>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/kyc">Pay Fee</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user && (user as any).kycStatus === 'submitted' && (user as any).kycFeePaid && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base text-blue-800">
                  Waiting for Approval
                </p>
                <p className="text-sm text-blue-700">
                  Your KYC documents and payment have been received. Our team is reviewing your verification. You'll be notified once approved.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}



        {user && (user as any).kycStatus === 'pending' && (user as any).kycFeePaid && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base text-orange-800">
                  Re-verification Required
                </p>
                <p className="text-sm text-orange-700">
                  Our team has requested additional verification. Please re-upload your documents to complete the process.
                </p>
              </div>
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Link href="/kyc">Update Documents</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user && (user as any).kycStatus === 'rejected' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base text-red-800">
                  KYC Verification Rejected
                </p>
                <p className="text-sm text-red-700">
                  Your KYC verification was rejected. Please re-upload your documents and contact support.
                </p>
              </div>
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                <Link href="/kyc">Resubmit KYC</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Suspension Alert - Only shows for KYC-completed users */}
        <SuspensionAlert />

        {/* Daily Target Warning - Only show if remaining hours > 0 to reduce notification fatigue */}
        {remainingHours > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1 text-sm sm:text-base">
                  {remainingHours.toFixed(1)} hours remaining today
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={progressPercentage} className="flex-1 max-w-xs h-2" />
                  <span className="text-sm text-gray-600 font-medium">{watchedHours.toFixed(1)}/{targetHours}h</span>
                </div>
                <p className="text-sm text-gray-600">
                  Complete your daily target to maintain account status and maximize earnings.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Daily Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <Target className="w-6 h-6 mr-3 text-blue-600" />
                Available Task Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Tasks Available Today</p>
                  <p className="text-2xl font-black text-gray-900">5 New Tasks</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Potential Earnings</p>
                  <p className="text-3xl font-black text-blue-600">₹135</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-1">App Downloads</p>
                    <p className="text-blue-700 text-sm font-bold">₹25 each</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-800 mb-1">Reviews</p>
                    <p className="text-green-700 text-sm font-bold">₹35 each</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-purple-800 mb-1">Quick Start</p>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    Complete your first task within 10 minutes and start earning immediately. Simple tasks with instant approval!
                  </p>
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg font-semibold"
                size="lg"
              >
                <Link href="/tasks">
                  <Target className="w-5 h-5 mr-2" />
                  Complete Tasks & Earn
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <Activity className="w-6 h-6 mr-3 text-green-600" />
                Professional Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="outline" className="justify-start h-auto p-4 border-green-200 hover:bg-green-50">
                  <Link href="/earnings">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">View Earnings</p>
                        <p className="text-sm text-gray-600">Track income and payouts</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start h-auto p-4 border-purple-200 hover:bg-purple-50">
                  <Link href="/referrals">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Referral Network</p>
                        <p className="text-sm text-gray-600">Expand professional network</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start h-auto p-4 border-blue-200 hover:bg-blue-50">
                  <Link href="/tasks">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Complete Tasks</p>
                        <p className="text-sm text-gray-600">Earn money with simple tasks</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start h-auto p-4 border-orange-200 hover:bg-orange-50">
                  <Link href="/kyc">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Account Verification</p>
                        <p className="text-sm text-gray-600">Complete KYC process</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            <Button variant="outline" size="sm" onClick={handleEditProfile} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Name:</span>
                    <span className="text-xs sm:text-sm font-medium truncate">{(user as any)?.firstName} {(user as any)?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Email:</span>
                    <span className="text-xs sm:text-sm font-medium truncate">{(user as any)?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Phone:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Date of Birth:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.dateOfBirth || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Address Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Address:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.address || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">City:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.city || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">State:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.state || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">PIN Code:</span>
                    <span className="text-xs sm:text-sm font-medium">{(user as any)?.pinCode || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Bank Details</h3>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Account Holder:</span>
                  <span className="text-xs sm:text-sm font-medium truncate">{(user as any)?.accountHolderName || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Account Number:</span>
                  <span className="text-xs sm:text-sm font-medium font-mono">
                    {(user as any)?.accountNumber ? `****${(user as any).accountNumber.slice(-4)}` : 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">IFSC Code:</span>
                  <span className="text-xs sm:text-sm font-medium font-mono">{(user as any)?.ifscCode || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Bank:</span>
                  <span className="text-xs sm:text-sm font-medium truncate">{(user as any)?.bankName || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Verification Status</h3>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Account Status:</span>
                  <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                    // Check if account is suspended first
                    (user as any)?.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    ((user as any)?.verificationStatus === 'verified' && (user as any)?.kycStatus === 'approved') ? 'bg-green-100 text-green-800' : 
                    ((user as any)?.verificationStatus === 'verified' && (user as any)?.kycStatus === 'submitted') ? 'bg-blue-100 text-blue-800' :
                    ((user as any)?.verificationStatus === 'pending' || (user as any)?.kycStatus === 'pending') ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {// Check if account is suspended first
                    (user as any)?.status === 'suspended' ? 'Suspended' :
                    ((user as any)?.verificationStatus === 'verified' && (user as any)?.kycStatus === 'approved') ? 'Approved' :
                     ((user as any)?.verificationStatus === 'verified' && (user as any)?.kycStatus === 'submitted') ? 'Payment Pending' :
                     ((user as any)?.verificationStatus === 'pending' || (user as any)?.kycStatus === 'pending') ? 'Pending Review' : 'Not Verified'}
                  </span>
                </div>
                {/* Debug Info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                    Debug: status={`${(user as any)?.status}`}, verificationStatus={`${(user as any)?.verificationStatus}`}, kycStatus={`${(user as any)?.kycStatus}`}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editingUser?.firstName || ''}
                      onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editingUser?.lastName || ''}
                      onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editingUser?.phoneNumber || ''}
                    onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editingUser?.dateOfBirth || ''}
                    onChange={(e) => setEditingUser({...editingUser, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={editingUser?.address || ''}
                    onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editingUser?.city || ''}
                      onChange={(e) => setEditingUser({...editingUser, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editingUser?.state || ''}
                      onChange={(e) => setEditingUser({...editingUser, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinCode">PIN Code</Label>
                    <Input
                      id="pinCode"
                      value={editingUser?.pinCode || ''}
                      onChange={(e) => setEditingUser({...editingUser, pinCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input
                      id="accountHolderName"
                      value={editingUser?.accountHolderName || ''}
                      onChange={(e) => setEditingUser({...editingUser, accountHolderName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={editingUser?.bankName || ''}
                      onChange={(e) => setEditingUser({...editingUser, bankName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={editingUser?.accountNumber || ''}
                      onChange={(e) => setEditingUser({...editingUser, accountNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={editingUser?.ifscCode || ''}
                      onChange={(e) => setEditingUser({...editingUser, ifscCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}