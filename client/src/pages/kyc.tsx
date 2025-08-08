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
  IdCard,
  ArrowRight,
  Star,
  Zap,
  FileText,
  Lock
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
  
  // Use localStorage to persist form state across re-renders
  const [govIdType, setGovIdType] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('kyc_govIdType') || "" : ""
  );
  const [govIdNumber, setGovIdNumber] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('kyc_govIdNumber') || "" : ""
  );
  const [govIdFrontUrl, setGovIdFrontUrl] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('kyc_govIdFrontUrl') || "" : ""
  );
  const [govIdBackUrl, setGovIdBackUrl] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('kyc_govIdBackUrl') || "" : ""
  );
  const [selfieWithIdUrl, setSelfieWithIdUrl] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('kyc_selfieWithIdUrl') || "" : ""
  );

  // Fetch user KYC status
  const { data: kycData, isLoading: isKycLoading, refetch: refetchKycData } = useQuery({
    queryKey: ["/api/kyc/status"],
    retry: false,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent constant refetching
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Check authentication and handle payment success
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
    
    // Handle payment success from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your KYC verification has been completed successfully.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, '', '/kyc');
      // Refresh KYC data
      refetchKycData();
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
      // Clear the URL parameter
      window.history.replaceState({}, '', '/kyc');
    }
  }, [isAuthenticated, isAuthLoading, toast, setLocation, refetchKycData]);

  // Handle localStorage cleanup only when KYC is fully complete  
  useEffect(() => {
    if (kycData) {
      const data = kycData as any;
      // Only clear localStorage when KYC is FULLY approved and verified
      if (data.kycStatus === 'approved' && data.verificationStatus === 'verified') {
        // Keep localStorage for now to avoid clearing during form usage
        // localStorage.removeItem('kyc_govIdType');
        // localStorage.removeItem('kyc_govIdNumber'); 
        // localStorage.removeItem('kyc_govIdFrontUrl');
        // localStorage.removeItem('kyc_govIdBackUrl');
        // localStorage.removeItem('kyc_selfieWithIdUrl');
      }
    }
  }, [kycData]);
  
  // Restore form state from localStorage on component mount
  useEffect(() => {
    const savedType = localStorage.getItem('kyc_govIdType');
    const savedNumber = localStorage.getItem('kyc_govIdNumber');
    const savedFront = localStorage.getItem('kyc_govIdFrontUrl');
    const savedBack = localStorage.getItem('kyc_govIdBackUrl');
    const savedSelfie = localStorage.getItem('kyc_selfieWithIdUrl');
    
    if (savedType && !govIdType) setGovIdType(savedType);
    if (savedNumber && !govIdNumber) setGovIdNumber(savedNumber);
    if (savedFront && !govIdFrontUrl) setGovIdFrontUrl(savedFront);
    if (savedBack && !govIdBackUrl) setGovIdBackUrl(savedBack);
    if (savedSelfie && !selfieWithIdUrl) setSelfieWithIdUrl(savedSelfie);
  }, []);

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

  // Create Cashfree payment session mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/kyc/create-payment");
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Payment session created:", data);
      
      // Check if this is a development payment completion
      if (data.status === 'development_payment_completed') {
        toast({
          title: "Payment Completed",
          description: "KYC payment processed successfully!",
        });
        
        // Automatically trigger verification since payment is complete
        setTimeout(() => {
          verifyPaymentMutation.mutate({ orderId: data.orderId });
        }, 1000);
      } else {
        toast({
          title: "Payment Session Created",
          description: "Redirecting to Cashfree payment gateway...",
        });
        
        // For real Cashfree payments, redirect to payment URL
        setTimeout(() => {
          verifyPaymentMutation.mutate({ orderId: data.orderId });
        }, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Session Failed",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify Cashfree payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await apiRequest("POST", "/api/kyc/verify-payment", { orderId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful",
        description: "KYC processing fee paid successfully via Cashfree. Your verification is now approved!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      setTimeout(() => {
        refetchKycData();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Payment Verification Failed",
        description: "Payment verification failed. Please contact support.",
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
      
      // The document URL should be extracted from the upload response
      // Based on the Google Cloud Storage response, we need to reconstruct the URL
      let documentUrl = uploadedFile.uploadURL;
      
      // If uploadURL is not available, try to construct it from the PUT response
      if (!documentUrl && uploadedFile.response && uploadedFile.response.uploadURL) {
        documentUrl = uploadedFile.response.uploadURL.split('?')[0]; // Remove query parameters
      }
      
      // If still no URL, try to get it from the successful upload response
      if (!documentUrl && uploadedFile.response && uploadedFile.response.body) {
        // For Google Cloud Storage, the URL pattern is known
        const bucketMatch = uploadedFile.response.uploadURL?.match(/googleapis\.com\/upload\/storage\/v1\/b\/([^\/]+)/);
        if (bucketMatch) {
          const bucketName = bucketMatch[1];
          const fileName = uploadedFile.name || `upload_${Date.now()}`;
          documentUrl = `https://storage.googleapis.com/${bucketName}/.private/uploads/${fileName}`;
        }
      }
      
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
      
      // Update state and localStorage - this should maintain persistence
      if (documentType === 'front') {
        setGovIdFrontUrl(documentUrl);
        localStorage.setItem('kyc_govIdFrontUrl', documentUrl);
        console.log("Set govIdFrontUrl to:", documentUrl);
      } else if (documentType === 'back') {
        setGovIdBackUrl(documentUrl);
        localStorage.setItem('kyc_govIdBackUrl', documentUrl);
        console.log("Set govIdBackUrl to:", documentUrl);
      } else if (documentType === 'selfie') {
        setSelfieWithIdUrl(documentUrl);
        localStorage.setItem('kyc_selfieWithIdUrl', documentUrl);
        console.log("Set selfieWithIdUrl to:", documentUrl);
      }

      // Save to backend asynchronously
      apiRequest("PUT", "/api/kyc/document", {
        documentUrl,
        documentType,
      }).then(() => {
        console.log("Document saved to backend successfully");
        toast({
          title: "Document Uploaded",
          description: `Your ${documentType === 'front' ? 'ID front' : documentType === 'back' ? 'ID back' : 'selfie'} has been uploaded successfully.`,
        });
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
    console.log("handleSubmitKyc called with data:", {
      govIdType,
      govIdNumber,
      govIdFrontUrl: govIdFrontUrl ? "✓" : "✗",
      govIdBackUrl: govIdBackUrl ? "✓" : "✗",
      selfieWithIdUrl: selfieWithIdUrl ? "✓" : "✗"
    });
    
    if (!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields and upload all documents.",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting KYC with mutation...");
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
    // Only show 100% if KYC is approved AND user is verified (not under re-verification)
    if ((kycData as any).kycStatus === 'approved' && (kycData as any).verificationStatus === 'verified') return 100;
    // If admin requested re-verification (pending status with previous fee payment), reset progress
    if ((kycData as any).kycStatus === 'pending' && (kycData as any).kycFeePaid) return 20;
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />
      
      <main className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">Professional Verification</h1>
              {/* Only show description if KYC not completed */}
              {!(kycData as any)?.kycStatus || (kycData as any)?.kycStatus !== 'approved' || (kycData as any)?.verificationStatus !== 'verified' ? (
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Secure identity verification to unlock professional earnings features</p>
              ) : (
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Your professional verification is complete and secure</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Guide for Pending Users or Re-verification */}
        {(!kycData || (kycData as any)?.kycStatus === 'pending' || (kycData as any)?.kycStatus === 'rejected') && (
          <Card className="mb-6 sm:mb-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-gray-900 flex items-center tracking-tight">
                <Zap className="w-6 h-6 mr-3 text-blue-600" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 bg-white/70 rounded-xl p-4 border border-blue-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <FileText className="text-blue-600 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">Upload Documents</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Complete the form and upload your government ID plus selfie for verification</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 bg-white/70 rounded-xl p-4 border border-blue-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <CreditCard className="text-green-600 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">Secure Payment</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">One-time ₹99 processing fee via secure Cashfree payment gateway</p>
                  </div>
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
              
              {(kycData as any)?.kycStatus === 'approved' && (kycData as any)?.verificationStatus === 'verified' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>KYC Completed!</strong> Your verification is complete. You can now receive payouts and access premium features.
                  </AlertDescription>
                </Alert>
              )}

              {(kycData as any)?.kycStatus === 'pending' && (kycData as any)?.kycFeePaid && (
                <Alert className="bg-orange-50 border-orange-200">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Re-verification Required</strong> - Our team has requested additional verification. Please re-upload your documents below to complete the process.
                  </AlertDescription>
                </Alert>
              )}

              {(kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid && (kycData as any)?.verificationStatus === 'verified' && (
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

        {/* Completion Status for Approved and Verified Users */}
        {(kycData as any)?.kycStatus === 'approved' && (kycData as any)?.verificationStatus === 'verified' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">KYC Verification Complete!</h3>
                <p className="text-green-700">Your documents have been verified successfully. You can now receive payouts and access all premium features.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {(kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid && (kycData as any)?.verificationStatus === 'verified' && (
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

        {/* Show KYC form for users who need verification or re-verification */}
        {(!kycData || !((kycData as any)?.kycStatus === 'approved' && (kycData as any)?.verificationStatus === 'verified')) && 
         !((kycData as any)?.kycStatus === 'submitted' && (kycData as any)?.kycFeePaid && (kycData as any)?.verificationStatus === 'verified') && (
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="govIdType" className="text-sm font-semibold text-gray-700">Government ID Type *</Label>
                    <Select value={govIdType} onValueChange={(value) => {
                    setGovIdType(value);
                    localStorage.setItem('kyc_govIdType', value);
                  }}>
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
                      onChange={(e) => {
                        setGovIdNumber(e.target.value);
                        localStorage.setItem('kyc_govIdNumber', e.target.value);
                      }}
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
                          onClick={() => {
                            setGovIdFrontUrl("");
                            localStorage.removeItem('kyc_govIdFrontUrl');
                          }}
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
                        <div className="flex items-center justify-center py-4 sm:py-6 px-3 sm:px-4">
                          <div className="text-center">
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">Upload front side of ID</div>
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
                          onClick={() => {
                            setGovIdBackUrl("");
                            localStorage.removeItem('kyc_govIdBackUrl');
                          }}
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
                          onClick={() => {
                            setSelfieWithIdUrl("");
                            localStorage.removeItem('kyc_selfieWithIdUrl');
                          }}
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

              {/* Debug: Log current state */}
              {console.log("Current form state:", { govIdType, govIdNumber, govIdFrontUrl, govIdBackUrl, selfieWithIdUrl })}
              
              {/* Complete KYC Section - Show after document upload */}
              {govIdType && govIdNumber && govIdFrontUrl && govIdBackUrl && selfieWithIdUrl && (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Complete KYC Verification</h3>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-green-900 text-sm sm:text-base">All Documents Uploaded</span>
                    </div>
                    <p className="text-green-700 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                      Great! All your documents have been uploaded successfully. 
                      Now pay the one-time ₹99 processing fee to complete your KYC verification.
                    </p>
                    
                    {/* Pay Processing Fee Button */}
                    <Button
                      onClick={() => {
                        console.log("Complete KYC button clicked");
                        console.log("Form data:", { govIdType, govIdNumber, govIdFrontUrl, govIdBackUrl, selfieWithIdUrl });
                        
                        console.log("All fields complete, submitting KYC...");
                        handleSubmitKyc();
                        setTimeout(() => {
                          console.log("Initiating Cashfree payment session...");
                          createPaymentMutation.mutate();
                        }, 500);
                      }}
                      disabled={submitKycMutation.isPending || createPaymentMutation.isPending || verifyPaymentMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base lg:text-lg py-3 px-4 rounded-lg"
                    >
                      {(submitKycMutation.isPending || createPaymentMutation.isPending || verifyPaymentMutation.isPending) ? "Processing..." : "Complete KYC"}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Show message for incomplete documents */}
              {(!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) && (() => {
                console.log("Missing fields:", { 
                  govIdType: !govIdType, 
                  govIdNumber: !govIdNumber, 
                  govIdFrontUrl: !govIdFrontUrl, 
                  govIdBackUrl: !govIdBackUrl, 
                  selfieWithIdUrl: !selfieWithIdUrl 
                });
                return null;
              })()}
              {(!govIdType || !govIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-900">Complete Document Upload</span>
                  </div>
                  <p className="text-blue-700">
                    Please fill in all information and upload all required documents above to proceed with payment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card - Only show if KYC not completed */}
        {!(kycData as any)?.kycStatus || (kycData as any)?.kycStatus !== 'approved' || (kycData as any)?.verificationStatus !== 'verified' ? (
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
        ) : null}
      </main>
    </div>
  );
}