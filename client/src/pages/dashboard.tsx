import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
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
  Users
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: stats } = useQuery({
    queryKey: ["/api/earnings/stats"],
    enabled: !!user,
  });

  const targetHours = 8;
  const watchedHours = stats?.dailyWatchTime ? stats.dailyWatchTime / 60 : 0;
  const progressPercentage = Math.min((watchedHours / targetHours) * 100, 100);
  const remainingHours = Math.max(targetHours - watchedHours, 0);

  const handleEditProfile = () => {
    setEditingUser({...user});
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
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {(user as any)?.firstName}!</h1>
          <p className="text-sm sm:text-base text-gray-600">Here's your profile dashboard</p>
        </div>

        {/* Earnings Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation" onClick={() => setLocation("/earnings-history")}>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">₹</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <button
                    onClick={() => setLocation("/earnings-history")}
                    className="text-xl font-bold text-gray-900 hover:text-green-600 underline-offset-2 hover:underline text-left"
                  >
                    ₹{stats?.totalEarnings || 0}
                  </button>
                  <p className="text-xs text-gray-400">Click to view history</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                  <p className="text-xl font-bold text-gray-900">₹{stats?.todayEarnings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Watch Time Today</p>
                  <p className="text-xl font-bold text-gray-900">{watchedHours.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(user as any)?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Target Reminder - Top Priority */}
        <Alert className={`mb-6 ${remainingHours > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
          <Clock className={`h-4 w-4 ${remainingHours > 0 ? 'text-orange-600' : 'text-green-600'}`} />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-1 text-sm sm:text-base">
                {remainingHours > 0 ? `${remainingHours.toFixed(1)} hours remaining today` : 'Daily target completed! 🎉'}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Progress value={progressPercentage} className="flex-1 max-w-xs h-2" />
                <span className="text-sm text-gray-600 font-medium">{watchedHours.toFixed(1)}/{targetHours}h</span>
              </div>
              <p className="text-sm text-gray-600">
                {remainingHours > 0 
                  ? 'Complete your daily target to maintain account status and maximize earnings.' 
                  : 'Great job! You can continue watching videos for extra earnings.'}
              </p>
            </div>
          </AlertDescription>
        </Alert>

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
                    (user as any)?.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                    (user as any)?.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {(user as any)?.verificationStatus === 'verified' ? 'Verified' :
                     (user as any)?.verificationStatus === 'pending' ? 'Pending Review' : 'Not Verified'}
                  </span>
                </div>
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
    </div>
  );
}