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
  Camera,
  Info,
  User,
  IdCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

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
    staleTime: 0,
    gcTime: 0,
  });

  // Auto-refresh KYC status every 10 seconds when submitted or waiting for approval
  useEffect(() => {
    if ((kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid) {
      const interval = setInterval(() => {
        refetchKycData();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [kycData, refetchKycData]);

  // Upload mutations with improved error handling
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return data.uploadURL;
    },
    onError: (error) => {
      console.error("Upload error:", error);
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
    },
    onError: (error) => {
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
    onSuccess: (data) => {
      toast({
        title: "Payment Successful",
        description: "KYC processing fee paid successfully. Your verification is now approved!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      setTimeout(() => {
        refetchKycData();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // File upload handlers with improved logic
  const handleFileUpload = async (documentType: 'front' | 'back' | 'selfie') => {
    try {
      const uploadURL = await uploadMutation.mutateAsync();
      return {
        method: "PUT" as const,
        url: uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload URL:", error);
      throw error;
    }
  };

  const handleUploadComplete = (documentType: 'front' | 'back' | 'selfie') => (result: any) => {
    console.log("Upload complete result:", result);
    
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      // Get the actual upload URL - this might be in different properties
      const documentUrl = uploadedFile.uploadURL || uploadedFile.url || uploadedFile.response?.uploadURL;
      
      console.log("Document URL extracted:", documentUrl);
      
      if (!documentUrl) {
        console.error("No document URL found in upload result:", uploadedFile);
        toast({
          title: "Upload Error",
          description: "Upload completed but couldn't get document URL. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
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
        
        // Refresh KYC data to get latest state
        refetchKycData();
      }).catch((error) => {
        console.error("Error saving document:", error);
        toast({
          title: "Save Error", 
          description: "Document uploaded but failed to save. Please try again.",
          variant: "destructive",
        });
      });
    } else {
      console.error("Upload failed, result:", result);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
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
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">KYC Verification</h1>
          <p className="text-sm sm:text-base text-gray-600">Complete your identity verification to start earning. One-time ₹99 processing fee required.</p>
        </div>

        {/* Quick Actions for Pending Users */}
        {(!kycData || (kycData as any)?.kycStatus === 'pending') && !(kycData as any)?.kycFeePaid && (
          <Card className="mb-6 sm:mb-8 border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center text-orange-900">
                <CreditCard className="w-5 h-5 mr-2" />
                Complete Your KYC Verification
              </CardTitle>
              <p className="text-orange-700">Two simple steps to unlock payouts and premium features:</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center mb-3">
                    <Upload className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Step 1: Upload Documents</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Upload your government ID and selfie</p>
                  <Button 
                    onClick={() => document.getElementById('kyc-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Upload Documents
                  </Button>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center mb-3">
                    <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-gray-900">Step 2: Pay Processing Fee</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">One-time ₹99 verification fee</p>
                  <Button
                    onClick={() => {
                      if (!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) {
                        toast({
                          title: "Documents Required",
                          description: "Please upload all documents first before paying the fee.",
                          variant: "destructive",
                        });
                        document.getElementById('kyc-form')?.scrollIntoView({ behavior: 'smooth' });
                        return;
                      }
                      handleSubmitKyc();
                      setTimeout(() => payFeeMutation.mutate(), 500);
                    }}
                    disabled={submitKycMutation.isPending || payFeeMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {(submitKycMutation.isPending || payFeeMutation.isPending) ? "Processing..." : "Pay ₹99 Fee"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Verification Status
              </CardTitle>
              {kycData ? getKycStatusBadge((kycData as any).kycStatus || 'pending') : null}
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

        {/* Completion Status for Approved */}
        {(kycData as any)?.kycStatus === 'approved' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">KYC Verification Complete!</h3>
                <p className="text-green-700">Your documents have been verified successfully. You can now receive payouts.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {(kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Under Review</h3>
                <p className="text-blue-700">Your documents and payment have been received. Our team is reviewing your verification.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show KYC form only if not approved */}
        {(kycData as any)?.kycStatus !== 'approved' && (
          <Card className="shadow-sm" id="kyc-form">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-gray-800">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                Complete KYC Verification
              </CardTitle>
              <p className="text-gray-600">Fill out all information and upload required documents to verify your identity.</p>
              
              {/* Prominent Processing Fee Notice */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-semibold text-yellow-900">Processing Fee Required</span>
                </div>
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Processing fee: ₹99 (one-time)</span> - Required to complete KYC verification and unlock payout features.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="govIdType" className="text-sm font-semibold text-gray-700">Government ID Type *</Label>
                    <Select value={govIdType} onValueChange={setGovIdType}>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select your ID type" />
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="govIdNumber" className="text-sm font-semibold text-gray-700">ID Number *</Label>
                    <Input
                      id="govIdNumber"
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                      placeholder="Enter your ID number"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Upload className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Document Upload</h3>
                </div>
                
                {/* ID Front Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <IdCard className="w-4 h-4 mr-2" />
                    ID Front Side *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {govIdFrontUrl ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded border border-green-200">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Front side uploaded successfully</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setGovIdFrontUrl("")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <ObjectUploader
                        onGetUploadParameters={() => handleFileUpload('front')}
                        onComplete={handleUploadComplete('front')}
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024}
                        buttonClassName="w-full h-auto p-0 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center py-6 px-4">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-600 font-medium">Upload front side of ID</div>
                            <div className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</div>
                          </div>
                        </div>
                      </ObjectUploader>
                    )}
                  </div>
                </div>

                {/* ID Back Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <IdCard className="w-4 h-4 mr-2" />
                    ID Back Side *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {govIdBackUrl ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded border border-green-200">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Back side uploaded successfully</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setGovIdBackUrl("")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <ObjectUploader
                        onGetUploadParameters={() => handleFileUpload('back')}
                        onComplete={handleUploadComplete('back')}
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024}
                        buttonClassName="w-full h-auto p-0 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center py-6 px-4">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-600 font-medium">Upload back side of ID</div>
                            <div className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</div>
                          </div>
                        </div>
                      </ObjectUploader>
                    )}
                  </div>
                </div>

                {/* Selfie Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Selfie with ID *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {selfieWithIdUrl ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded border border-green-200">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Selfie uploaded successfully</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelfieWithIdUrl("")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <ObjectUploader
                        onGetUploadParameters={() => handleFileUpload('selfie')}
                        onComplete={handleUploadComplete('selfie')}
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024}
                        buttonClassName="w-full h-auto p-0 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center py-6 px-4">
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-600 font-medium">Take a selfie with your ID</div>
                            <div className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</div>
                          </div>
                        </div>
                      </ObjectUploader>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Take a clear selfie holding your government ID next to your face</p>
                </div>
              </div>

              {/* Submit and Payment Section - Always show when documents are uploaded */}
              {govIdType && govIdNumber && govIdFrontUrl && govIdBackUrl && selfieWithIdUrl && (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Complete Verification</h3>
                  </div>
                  
                  {/* Submit button for pending status */}
                  {(!kycData || (kycData as any)?.kycStatus === 'pending') && !(kycData as any)?.kycSubmittedAt && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Info className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-blue-900">Ready to Submit</span>
                      </div>
                      <p className="text-blue-700 mb-4">All documents uploaded successfully. Click submit to continue with verification.</p>
                      <Button
                        onClick={handleSubmitKyc}
                        disabled={submitKycMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {submitKycMutation.isPending ? "Submitting..." : "Submit for Review"}
                      </Button>
                    </div>
                  )}

                  {/* Payment button for submitted but unpaid status */}
                  {(kycData as any)?.kycStatus === 'submitted' && !(kycData as any)?.kycFeePaid && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="font-semibold text-yellow-900">Payment Required</span>
                      </div>
                      <p className="text-yellow-700 mb-4">Documents submitted! Pay the one-time ₹99 processing fee to complete verification.</p>
                      <Button
                        onClick={() => payFeeMutation.mutate()}
                        disabled={payFeeMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {payFeeMutation.isPending ? "Processing Payment..." : "Pay ₹99 Processing Fee"}
                      </Button>
                    </div>
                  )}
                  
                  {/* Direct payment option if all documents are ready but no submission yet */}
                  {(!kycData || (kycData as any)?.kycStatus === 'pending') && !(kycData as any)?.kycSubmittedAt && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-900">Quick Complete</span>
                      </div>
                      <p className="text-green-700 mb-4">Skip review and pay the one-time ₹99 processing fee now to complete verification instantly.</p>
                      <Button
                        onClick={() => {
                          // First submit, then pay
                          handleSubmitKyc();
                          setTimeout(() => payFeeMutation.mutate(), 500);
                        }}
                        disabled={submitKycMutation.isPending || payFeeMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {(submitKycMutation.isPending || payFeeMutation.isPending) ? "Processing..." : "Complete KYC + Pay ₹99 Fee"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Verification Process</h4>
                <ul className="space-y-1 text-sm text-gray-600">
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