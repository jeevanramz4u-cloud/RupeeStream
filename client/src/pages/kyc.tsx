import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CreditCard,
  FileText,
  Camera,
  Info,
  ArrowLeft
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UploadResult } from "@uppy/core";

export default function KYC() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  
  const [govIdType, setGovIdType] = useState("");
  const [govIdNumber, setGovIdNumber] = useState("");
  const [govIdFrontUrl, setGovIdFrontUrl] = useState("");
  const [govIdBackUrl, setGovIdBackUrl] = useState("");
  const [selfieWithIdUrl, setSelfieWithIdUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Check authentication
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access KYC verification.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1000);
    }
  }, [isAuthenticated, isAuthLoading, toast, setLocation]);

  // Fetch user KYC status
  const { data: kycData, isLoading: isKycLoading } = useQuery({
    queryKey: ["/api/kyc/status"],
    retry: false,
    enabled: !!user,
  });

  // Upload mutations
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return data.uploadURL;
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit KYC mutation
  const submitKycMutation = useMutation({
    mutationFn: async (kycData: any) => {
      const response = await apiRequest("POST", "/api/kyc/submit", kycData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC documents have been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      setCurrentStep(4); // Move to payment step
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: "Failed to submit KYC. Please try again.",
        variant: "destructive",
      });
    },
  });

  // KYC fee payment mutation
  const payKycFeeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/kyc/pay-fee");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Initiated",
        description: "Redirecting to payment gateway...",
      });
      // Redirect to payment URL or handle payment flow
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (type: 'front' | 'back' | 'selfie') => {
    try {
      const uploadUrl = await uploadMutation.mutateAsync();
      return uploadUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>, type: 'front' | 'back' | 'selfie') => {
    if (result.successful && result.successful.length > 0) {
      const uploadUrl = result.successful[0].uploadURL;
      
      // Set the ACL and get the normalized path
      const response = await apiRequest("PUT", "/api/kyc/document", {
        documentUrl: uploadUrl,
        documentType: type
      });
      const data = await response.json();
      
      switch (type) {
        case 'front':
          setGovIdFrontUrl(data.objectPath);
          break;
        case 'back':
          setGovIdBackUrl(data.objectPath);
          break;
        case 'selfie':
          setSelfieWithIdUrl(data.objectPath);
          break;
      }
      
      toast({
        title: "Upload Successful",
        description: `${type === 'front' ? 'Front side' : type === 'back' ? 'Back side' : 'Selfie'} uploaded successfully.`,
      });
    }
  };

  const handleSubmitKyc = () => {
    if (!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all fields and upload all required documents.",
        variant: "destructive",
      });
      return;
    }

    submitKycMutation.mutate({
      governmentIdType: govIdType,
      governmentIdNumber: govIdNumber,
      govIdFrontUrl,
      govIdBackUrl,
      selfieWithIdUrl,
    });
  };

  if (isAuthLoading || isKycLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading KYC status...</p>
        </div>
      </div>
    );
  }

  const kycStatus = (kycData as any)?.kycStatus || 'pending';
  const kycFeePaid = (kycData as any)?.kycFeePaid || false;

  // Calculate current step based on KYC status
  const getStepFromStatus = () => {
    if (kycStatus === 'approved' && kycFeePaid) return 5;
    if (kycStatus === 'submitted' && !kycFeePaid) return 4;
    if (kycStatus === 'submitted' && kycFeePaid) return 5;
    return 1;
  };

  const actualStep = currentStep || getStepFromStatus();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
            </div>
            <Badge variant={
              kycStatus === 'approved' ? 'default' : 
              kycStatus === 'submitted' ? 'secondary' : 
              kycStatus === 'rejected' ? 'destructive' : 'outline'
            }>
              {kycStatus === 'approved' ? 'Approved' :
               kycStatus === 'submitted' ? 'Under Review' :
               kycStatus === 'rejected' ? 'Rejected' : 'Pending'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
            <span>Progress</span>
            <span>{actualStep}/5 steps</span>
          </div>
          <Progress value={(actualStep / 5) * 100} className="h-2" />
        </div>

        {/* KYC Fee Notice */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>One-time KYC Processing Fee: ₹99</strong><br />
            This is a one-time fee for document verification. EarnPay is lifetime free with no monthly or annual charges.
            You can only request payouts after completing KYC verification and fee payment.
          </AlertDescription>
        </Alert>

        {kycStatus === 'approved' && kycFeePaid ? (
          /* KYC Approved */
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">KYC Verified!</h2>
              <p className="text-gray-600 mb-4">
                Your identity has been verified and KYC fee has been paid. You can now request payouts.
              </p>
              <Button onClick={() => setLocation("/earnings")}>
                <CreditCard className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </CardContent>
          </Card>
        ) : kycStatus === 'submitted' && !kycFeePaid ? (
          /* Documents submitted, payment pending */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your documents have been submitted successfully. Please pay the KYC processing fee to complete verification.
              </p>
              <Button 
                onClick={() => payKycFeeMutation.mutate()}
                disabled={payKycFeeMutation.isPending}
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {payKycFeeMutation.isPending ? 'Processing...' : 'Pay KYC Fee (₹99)'}
              </Button>
            </CardContent>
          </Card>
        ) : kycStatus === 'submitted' && kycFeePaid ? (
          /* Under review */
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-orange-700 mb-2">Under Review</h2>
              <p className="text-gray-600">
                Your KYC documents and payment are being reviewed. This typically takes 24-48 hours.
              </p>
            </CardContent>
          </Card>
        ) : kycStatus === 'rejected' ? (
          /* KYC Rejected */
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">KYC Rejected</h2>
              <p className="text-gray-600 mb-4">
                Your KYC submission was rejected. Please contact support for more information or resubmit with correct documents.
              </p>
              <Button variant="outline" onClick={() => {
                setCurrentStep(1);
                setGovIdType("");
                setGovIdNumber("");
                setGovIdFrontUrl("");
                setGovIdBackUrl("");
                setSelfieWithIdUrl("");
              }}>
                Resubmit KYC
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* KYC Form */
          <div className="space-y-6">
            {/* Step 1: Government ID Information */}
            {actualStep >= 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Step 1: Government ID Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="govIdType">Government ID Type</Label>
                    <select
                      id="govIdType"
                      value={govIdType}
                      onChange={(e) => setGovIdType(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="govIdNumber">Government ID Number</Label>
                    <Input
                      id="govIdNumber"
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                      placeholder="Enter your ID number"
                    />
                  </div>
                  {govIdType && govIdNumber && (
                    <Button onClick={() => setCurrentStep(2)}>
                      Continue to Document Upload
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Document Uploads */}
            {actualStep >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Step 2: Upload Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Front Side Upload */}
                  <div>
                    <Label className="text-sm font-medium">Government ID - Front Side</Label>
                    <div className="mt-2">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        onGetUploadParameters={() => handleFileUpload('front')}
                        onComplete={(result) => handleUploadComplete(result, 'front')}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {govIdFrontUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Upload className="w-4 h-4" />}
                          <span>{govIdFrontUrl ? 'Front Side Uploaded' : 'Upload Front Side'}</span>
                        </div>
                      </ObjectUploader>
                    </div>
                  </div>

                  {/* Back Side Upload */}
                  <div>
                    <Label className="text-sm font-medium">Government ID - Back Side</Label>
                    <div className="mt-2">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        onGetUploadParameters={() => handleFileUpload('back')}
                        onComplete={(result) => handleUploadComplete(result, 'back')}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {govIdBackUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Upload className="w-4 h-4" />}
                          <span>{govIdBackUrl ? 'Back Side Uploaded' : 'Upload Back Side'}</span>
                        </div>
                      </ObjectUploader>
                    </div>
                  </div>

                  {/* Selfie Upload */}
                  <div>
                    <Label className="text-sm font-medium">Selfie with Government ID</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Take a clear selfie while holding your government ID next to your face
                    </p>
                    <div className="mt-2">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        onGetUploadParameters={() => handleFileUpload('selfie')}
                        onComplete={(result) => handleUploadComplete(result, 'selfie')}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {selfieWithIdUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Camera className="w-4 h-4" />}
                          <span>{selfieWithIdUrl ? 'Selfie Uploaded' : 'Upload Selfie with ID'}</span>
                        </div>
                      </ObjectUploader>
                    </div>
                  </div>

                  {govIdFrontUrl && govIdBackUrl && selfieWithIdUrl && (
                    <Button onClick={() => setCurrentStep(3)} className="w-full">
                      Continue to Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review and Submit */}
            {actualStep >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Step 3: Review and Submit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p><strong>ID Type:</strong> {govIdType}</p>
                      <p><strong>ID Number:</strong> {govIdNumber}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        {govIdFrontUrl ? (
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm">Front Side</p>
                      </div>
                      <div className="text-center">
                        {govIdBackUrl ? (
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm">Back Side</p>
                      </div>
                      <div className="text-center">
                        {selfieWithIdUrl ? (
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm">Selfie</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubmitKyc}
                      disabled={submitKycMutation.isPending}
                      className="w-full"
                    >
                      {submitKycMutation.isPending ? 'Submitting...' : 'Submit KYC Documents'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}