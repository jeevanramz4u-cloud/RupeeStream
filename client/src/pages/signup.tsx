import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  User, 
  MapPin, 
  CreditCard, 
  FileText,
  Upload,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [governmentIdUrl, setGovernmentIdUrl] = useState("");
  
  // Get referral code from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  const [referralInfo, setReferralInfo] = useState<string | null>(referralCode);

  const [formData, setFormData] = useState({
    // Personal Information
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    
    // Address Information
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Bank Details
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    

    
    // Terms
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const steps = [
    { number: 1, title: "Account Details", icon: User },
    { number: 2, title: "Personal Info", icon: FileText },
    { number: 3, title: "Address", icon: MapPin },
    { number: 4, title: "Bank Details", icon: CreditCard },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 4) {
      // Validate current step before proceeding
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    // Final submission
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          referralCode: referralInfo, // Include referral code
        }),
      });

      if (response.ok) {
        toast({
          title: "Account Created Successfully!",
          description: "You can now log in to your account.",
        });
        // Redirect to login page
        setLocation('/login');
      } else {
        const data = await response.json();
        const errorMessage = data.message || 'Registration failed';
        setError(errorMessage);
        toast({
          title: "Signup Failed",
          description: errorMessage.includes('User already exists') 
            ? "An account with this email already exists. Please use a different email or try logging in."
            : errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError("Please fill in all required fields");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.dateOfBirth || !formData.gender) {
          setError("Please fill in all required fields");
          return false;
        }
        // Validate phone number (must be exactly 10 digits after +91)
        const phoneDigits = formData.phoneNumber?.replace('+91', '') || '';
        if (phoneDigits.length !== 10 || !/^\d{10}$/.test(phoneDigits)) {
          setError("Phone number must be exactly 10 digits");
          return false;
        }
        // Validate age (must be 18+)
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
        
        if (actualAge < 18) {
          setError("You must be 18 years or older to register");
          return false;
        }
        break;
      case 3:
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 4:
        if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
          setError("Please fill in all required fields");
          return false;
        }
        if (!formData.acceptTerms || !formData.acceptPrivacy) {
          setError("Please accept the terms and privacy policy");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGovernmentIdUpload = async () => {
    try {
      const response = await fetch('/api/objects/upload-temp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }
      
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload URL:', error);
      toast({
        title: "Upload Error",
        description: "Could not prepare file upload. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful[0]) {
      setGovernmentIdUrl(result.successful[0].uploadURL);
      toast({
        title: "Upload Successful",
        description: "Your government ID has been uploaded successfully",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password * (minimum 8 characters)</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (minimum 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password (minimum 8 characters)"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number * (10 digits)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  +91
                </span>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phoneNumber?.replace('+91', '') || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({
                      ...formData,
                      phoneNumber: value ? `+91${value}` : ''
                    });
                  }}
                  className="pl-12"
                  required
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth * (Must be 18+)</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                required
              />
              <p className="text-sm text-gray-500 mt-1">You must be 18 years or older to register</p>
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange(value, 'gender')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="city" className="text-sm">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="h-10 sm:h-11 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="h-10 sm:h-11 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">PIN Code *</Label>
              <Input
                id="pincode"
                name="pincode"
                placeholder="123456"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                name="accountHolderName"
                placeholder="Name as per bank account"
                value={formData.accountHolderName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ifscCode">IFSC Code *</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  placeholder="ABCD0123456"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Bank name"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-medium text-gray-900">Terms and Conditions</h3>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptTerms: !!checked })
                  }
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms-conditions" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptPrivacy: !!checked })
                  }
                />
                <Label htmlFor="acceptPrivacy" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />
      
      <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-primary/5 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="text-white w-8 h-8" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">Join Innovative Task Earn</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Start your professional earning journey today</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      currentStep >= step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs text-center ${
                    currentStep >= step.number ? 'text-primary font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`absolute w-16 h-0.5 mt-5 ml-10 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </h2>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {renderStepContent()}

              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-black text-lg px-8 py-6 h-auto rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : currentStep === 4 ? (
                    "Create Account & Start Earning"
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-base text-gray-600 font-medium">
                Already have an account?{" "}
                <Link href="/login">
                  <Button variant="link" className="p-0 h-auto text-primary font-black text-base hover:text-primary/80">
                    Sign in here
                  </Button>
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}