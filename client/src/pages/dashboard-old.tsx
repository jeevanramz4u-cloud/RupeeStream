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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  TriangleAlert,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  Edit,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

        {/* Daily Target Reminder - Top Priority */}
        <Alert className={`mb-6 ${remainingHours > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
          <Clock className={`h-4 w-4 ${remainingHours > 0 ? 'text-orange-600' : 'text-green-600'}`} />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">
                {remainingHours > 0 ? `${remainingHours.toFixed(1)} hours remaining today` : 'Daily target completed! 🎉'}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Progress value={progressPercentage} className="flex-1 max-w-xs" />
                <span className="text-sm text-gray-600">{watchedHours.toFixed(1)}/{targetHours}h</span>
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
                      value={(editingUser as any)?.firstName || ''}
                      onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={(editingUser as any)?.lastName || ''}
                      onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={(editingUser as any)?.phoneNumber || ''}
                    onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={(editingUser as any)?.dateOfBirth || ''}
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
                    value={(editingUser as any)?.address || ''}
                    onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={(editingUser as any)?.city || ''}
                      onChange={(e) => setEditingUser({...editingUser, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={(editingUser as any)?.state || ''}
                      onChange={(e) => setEditingUser({...editingUser, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinCode">PIN Code</Label>
                    <Input
                      id="pinCode"
                      value={(editingUser as any)?.pinCode || ''}
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
                      value={(editingUser as any)?.accountHolderName || ''}
                      onChange={(e) => setEditingUser({...editingUser, accountHolderName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={(editingUser as any)?.bankName || ''}
                      onChange={(e) => setEditingUser({...editingUser, bankName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={(editingUser as any)?.accountNumber || ''}
                      onChange={(e) => setEditingUser({...editingUser, accountNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={(editingUser as any)?.ifscCode || ''}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">₹{(stats as any)?.todayEarnings || '0.00'}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center ml-2">
                  <Coins className="text-secondary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
                <span className="text-xs text-gray-500 mt-1 block">{Math.round(progressPercentage)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Watch Time Today</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{Math.floor(watchedHours)}h {Math.floor((watchedHours % 1) * 60)}m</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-2">
                  <Clock className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
                <span className="text-xs text-gray-500 mt-1 block">{Math.floor(watchedHours)}/{targetHours} hours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Videos Watched</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center ml-2">
                  <PlayCircle className="text-accent w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs text-gray-500">+0 from yesterday</p>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Referral Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">₹0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/10 rounded-lg flex items-center justify-center ml-2">
                  <Users className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">0 successful referrals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="touch-manipulation">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                My Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Personal Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Personal Information</h3>
                  <div className="space-y-2.5 sm:space-y-3">
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
                      <span className="text-xs sm:text-sm font-medium truncate">{(user as any)?.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Date of Birth:</span>
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {(user as any)?.dateOfBirth ? new Date((user as any).dateOfBirth).toLocaleDateString('en-IN') : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Address</h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm min-w-0 flex-1">
                        <p className="font-medium break-words">{(user as any)?.address || 'Not provided'}</p>
                        <p className="text-gray-600 break-words">{(user as any)?.city || ''}{(user as any)?.city && (user as any)?.state ? ', ' : ''}{(user as any)?.state || ''}</p>
                        {(user as any)?.pincode && <p className="text-gray-600">PIN: {(user as any).pincode}</p>}
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
