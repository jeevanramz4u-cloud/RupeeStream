import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@/components/ObjectUploader";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  User,
  IdCard,
  CameraIcon
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
  const { data: kycData, isLoading: isKycLoading, refetch: refetchKycData } = useQuery({
    queryKey: ["/api/kyc/status"],
    retry: false,
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
  });

  // Auto-refresh KYC status every 10 seconds when submitted or waiting for approval
  useEffect(() => {
    if ((kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid) {
      const interval = setInterval(() => {
        refetchKycData();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [kycData, refetchKycData]);

  // Upload mutations
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return data.uploadURL;
    },
    onError: (error) => {
      console.error("Upload error:", error);
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

  // Pay KYC fee mutation
  const payFeeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/kyc/pay-fee");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "KYC processing fee paid successfully. Your documents will be reviewed soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      setCurrentStep(5);
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
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // File upload handlers
  const handleFileUpload = async (documentType: 'front' | 'back' | 'selfie') => {
    return {
      method: "PUT" as const,
      url: await uploadMutation.mutateAsync(),
    };
  };

  const handleUploadComplete = (documentType: 'front' | 'back' | 'selfie') => (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const documentUrl = uploadedFile.uploadURL;
      
      // Update the appropriate state
      if (documentType === 'front') {
        setGovIdFrontUrl(documentUrl);
      } else if (documentType === 'back') {
        setGovIdBackUrl(documentUrl);
      } else if (documentType === 'selfie') {
        setSelfieWithIdUrl(documentUrl);
      }

      // Save to backend
      apiRequest("PUT", "/api/kyc/document", {
        documentUrl,
        documentType,
      }).then(() => {
        toast({
          title: "Document Uploaded",
          description: `Your ${documentType === 'front' ? 'ID front' : documentType === 'back' ? 'ID back' : 'selfie'} has been uploaded successfully.`,
        });
      }).catch((error) => {
        console.error("Error saving document:", error);
      });
    }
  };

  const handleSubmitKyc = () => {
    if (!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields and upload all documents.",
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

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Info className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Unknown</Badge>;
    }
  };

  const getProgressPercentage = () => {
    if (!kycData) return 0;
    if ((kycData as any).kycStatus === 'approved') return 100;
    if ((kycData as any).kycFeePaid) return 80;
    if ((kycData as any).kycStatus === 'submitted') return 60;
    if (govIdFrontUrl && govIdBackUrl && selfieWithIdUrl) return 40;
    if (govIdType && govIdNumber) return 20;
    return 0;
  };

  if (isAuthLoading || isKycLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 safe-area-padding">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">KYC Verification</h1>
          <p className="text-sm sm:text-base text-gray-600">Complete your identity verification to start earning. One-time ₹99 processing fee required.</p>
        </div>

        {/* Status Overview */}
        <Card className="mb-6 sm:mb-8 touch-manipulation">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Verification Status
              </CardTitle>
              {kycData && getKycStatusBadge((kycData as any).kycStatus || 'pending')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              
              {(kycData as any)?.kycStatus === 'approved' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>KYC Completed!</strong> Your verification is complete. You can now receive payouts and access premium features.
                  </AlertDescription>
                </Alert>
              )}

              {(kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Waiting for Approval</strong> - Your documents and payment have been received. Our team is reviewing your verification. You'll be notified once approved.
                  </AlertDescription>
                </Alert>
              )}
              
              {(kycData as any)?.kycStatus === 'rejected' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Your KYC verification was rejected. Please re-upload your documents and contact support for assistance.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KYC Steps - Hide if submitted/approved, show only if pending/rejected */}
        {((kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid) || (kycData as any)?.kycStatus === 'approved' ? (
          // Show completion status instead of steps when fully submitted or approved
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                {(kycData as any)?.kycStatus === 'approved' ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC Verification Complete!</h3>
                    <p className="text-gray-600">Your documents have been verified successfully. You can now receive payouts.</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Under Review</h3>
                    <p className="text-gray-600">Your documents and payment have been received. Our team is reviewing your verification.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Show KYC steps for pending/rejected status
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Step 1: Personal Information */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                1. Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="govIdType" className="text-sm font-medium">Government ID Type</Label>
                  <Select value={govIdType} onValueChange={setGovIdType} disabled={(kycData as any)?.kycStatus === 'approved'}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="pan">PAN Card</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="govIdNumber" className="text-sm font-medium">ID Number</Label>
                  <Input
                    id="govIdNumber"
                    value={govIdNumber}
                    onChange={(e) => setGovIdNumber(e.target.value)}
                    placeholder="Enter your ID number"
                    className="mt-1"
                    disabled={(kycData as any)?.kycStatus === 'approved'}
                  />
                </div>

                {govIdType && govIdNumber && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Information saved
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: ID Front Upload */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <IdCard className="w-4 h-4 mr-2 text-blue-600" />
                2. ID Front Side
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Upload a clear photo of the front side of your government ID.</p>
                
                {(kycData as any)?.kycStatus === 'approved' ? (
                  <div className="flex items-center justify-center p-4 border-2 border-green-200 border-dashed rounded-lg bg-green-50">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700">Document verified</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'submitted' || (kycData as any)?.kycFeePaid ? (
                  <div className="flex items-center justify-center p-4 border-2 border-blue-200 border-dashed rounded-lg bg-blue-50">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700">Document submitted - Under review</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'rejected' ? (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('front')}
                    onComplete={handleUploadComplete('front')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Re-upload Front Side
                    </div>
                  </ObjectUploader>
                ) : (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('front')}
                    onComplete={handleUploadComplete('front')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {govIdFrontUrl ? 'Update Front Side' : 'Upload Front Side'}
                    </div>
                  </ObjectUploader>
                )}

                {govIdFrontUrl && (kycData as any)?.kycStatus === 'pending' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Front side uploaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: ID Back Upload */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <IdCard className="w-4 h-4 mr-2 text-blue-600" />
                3. ID Back Side
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Upload a clear photo of the back side of your government ID.</p>
                
                {(kycData as any)?.kycStatus === 'approved' ? (
                  <div className="flex items-center justify-center p-4 border-2 border-green-200 border-dashed rounded-lg bg-green-50">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700">Document verified</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'submitted' || (kycData as any)?.kycFeePaid ? (
                  <div className="flex items-center justify-center p-4 border-2 border-blue-200 border-dashed rounded-lg bg-blue-50">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700">Document submitted - Under review</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'rejected' ? (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('back')}
                    onComplete={handleUploadComplete('back')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Re-upload Back Side
                    </div>
                  </ObjectUploader>
                ) : (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('back')}
                    onComplete={handleUploadComplete('back')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {govIdBackUrl ? 'Update Back Side' : 'Upload Back Side'}
                    </div>
                  </ObjectUploader>
                )}

                {govIdBackUrl && (kycData as any)?.kycStatus === 'pending' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Back side uploaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Selfie Upload */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <CameraIcon className="w-4 h-4 mr-2 text-blue-600" />
                4. Selfie with ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Take a selfie holding your government ID next to your face.</p>
                
                {(kycData as any)?.kycStatus === 'approved' ? (
                  <div className="flex items-center justify-center p-4 border-2 border-green-200 border-dashed rounded-lg bg-green-50">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700">Selfie verified</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'submitted' || (kycData as any)?.kycFeePaid ? (
                  <div className="flex items-center justify-center p-4 border-2 border-blue-200 border-dashed rounded-lg bg-blue-50">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700">Selfie submitted - Under review</p>
                    </div>
                  </div>
                ) : (kycData as any)?.kycStatus === 'rejected' ? (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('selfie')}
                    onComplete={handleUploadComplete('selfie')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Re-upload Selfie
                    </div>
                  </ObjectUploader>
                ) : (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={() => handleFileUpload('selfie')}
                    onComplete={handleUploadComplete('selfie')}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center">
                      <Camera className="w-4 h-4 mr-2" />
                      {selfieWithIdUrl ? 'Update Selfie' : 'Upload Selfie'}
                    </div>
                  </ObjectUploader>
                )}

                {selfieWithIdUrl && (kycData as any)?.kycStatus === 'pending' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Selfie uploaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Submit for Review */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                5. Submit for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Submit your documents for admin review.</p>
                
                {(kycData as any)?.kycStatus === 'pending' ? (
                  <Button 
                    onClick={handleSubmitKyc}
                    disabled={!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl || submitKycMutation.isPending}
                    className="w-full"
                  >
                    {submitKycMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    Submit for Review
                  </Button>
                ) : (
                  <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700">Documents submitted</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Processing Fee */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                6. Processing Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Pay ₹99 one-time processing fee to complete verification.</p>
                
                {(kycData as any)?.kycStatus === 'approved' ? (
                  <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">Verification complete</span>
                  </div>
                ) : (kycData as any)?.kycFeePaid ? (
                  <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700">Payment received - Under review</span>
                  </div>
                ) : (kycData as any)?.kycStatus === 'submitted' ? (
                  <Button 
                    onClick={() => payFeeMutation.mutate()}
                    disabled={payFeeMutation.isPending}
                    className="w-full"
                  >
                    {payFeeMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Pay ₹99 Fee
                  </Button>
                ) : (
                  <div className="text-center p-3 border-2 border-gray-200 border-dashed rounded-lg">
                    <span className="text-sm text-gray-500">Submit documents first</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-6 sm:mt-8 touch-manipulation">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Document Requirements:</h4>
                <ul className="space-y-1">
                  <li>• Clear, well-lit photos</li>
                  <li>• All text must be readable</li>
                  <li>• No blurred or cropped images</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Processing Timeline:</h4>
                <ul className="space-y-1">
                  <li>• Document review: 24-48 hours</li>
                  <li>• Processing fee: ₹99 (one-time)</li>
                  <li>• Verification result via email</li>
                  <li>• Contact support if needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}