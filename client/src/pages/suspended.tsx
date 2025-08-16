import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CreditCard, Clock, Shield, LogOut, Home, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";

export default function SuspendedPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect non-suspended users away from this page
  useEffect(() => {
    if (!isLoading && user && (user as any)?.status !== 'suspended') {
      
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  // Don't render for non-suspended users
  if (!isLoading && user && (user as any)?.status !== 'suspended') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const reactivationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/account/reactivate-payment"),
    onSuccess: (data: any) => {
      
      
      if (data.paymentUrl) {
        toast({
          title: "Payment Gateway Ready",
          description: "Redirecting to secure Cashfree payment gateway for reactivation fee processing...",
        });
        
        // Redirect to Cashfree payment gateway
        setTimeout(() => {
          window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
          
          // Start polling for payment completion
          setTimeout(() => {
            verifyPaymentMutation.mutate({ orderId: data.orderId });
          }, 5000);
        }, 1500);
      } else {
        toast({
          title: "Payment Gateway Error",
          description: "Failed to initialize payment gateway. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Session Failed",
        description: error.message || "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessingPayment(false);
    }
  });
  
  // Verify reactivation payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await apiRequest("POST", "/api/account/verify-reactivation-payment", { orderId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowSuccessModal(true);
        
        toast({
          title: "Account Successfully Reactivated! 🎉",
          description: "Your production payment has been verified and account is now active. You can start earning again!",
        });
        
        // Auto-redirect after showing success message
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
          setLocation("/dashboard");
        }, 3000);
      } else {
        toast({
          title: "Payment Verification Status",
          description: data.message || "Payment verification in progress via production Cashfree API. Please check back shortly.",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Unable to verify payment status with production Cashfree API";
      toast({
        title: "Payment Verification Status",
        description: `${errorMessage}. If you completed the payment, it may take a few minutes to process.`,
        variant: "destructive",
      });
    },
  });

  const handleReactivateAccount = () => {
    setIsProcessingPayment(true);
    reactivationMutation.mutate();
  };

  // Block navigation for suspended users by overriding browser back/forward
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((user as any)?.status === 'suspended') {
        e.preventDefault();
        e.returnValue = 'You cannot navigate away from this page while your account is suspended.';
      }
    };

    const handlePopState = () => {
      if ((user as any)?.status === 'suspended') {
        window.history.pushState(null, '', '/suspended');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push suspended state to prevent back navigation
    if ((user as any)?.status === 'suspended') {
      window.history.pushState(null, '', '/suspended');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user]);

  const suspensionReason = (user as any)?.suspensionReason || "Failed to meet daily watch time requirements for 3 consecutive days";
  const reactivationFee = (user as any)?.reactivationFeeAmount || "49.00";

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="flex items-center justify-center p-3 sm:p-4 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Suspension Notice */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-red-700">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                <strong>Suspension Reason:</strong> {suspensionReason}
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-xs sm:text-sm text-gray-600 space-y-1">
              <p>Your account was suspended on {(user as any)?.suspendedAt ? new Date((user as any).suspendedAt).toLocaleDateString() : 'recently'}.</p>
              <p>To continue using Innovative Task Earn, you need to reactivate your account.</p>
            </div>
          </CardContent>
        </Card>

        {/* Reactivation Card */}
        <Card>
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Reactivate Your Account</CardTitle>
            <p className="text-sm sm:text-base text-gray-600">Pay the reactivation fee to restore access to your dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Reactivation Fee */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-blue-700">Reactivation Fee</p>
                    <p className="text-xs sm:text-sm text-blue-600">One-time payment to restore account access</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-blue-700">₹{reactivationFee}</p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold text-sm sm:text-base text-yellow-800 mb-2">🔔 How to Reactivate:</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-yellow-700">
                <li>Click the "Pay ₹{reactivationFee} via Cashfree" button below</li>
                <li>You'll be redirected to secure payment gateway</li>
                <li>Complete payment using UPI, Card, or Net Banking</li>
                <li>Account will be instantly reactivated</li>
                <li>You'll return to your dashboard automatically!</li>
              </ol>
            </div>

            {/* What happens after reactivation */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base text-gray-900">After Reactivation:</h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span>Immediate access to dashboard and all features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span>Fresh start with task completion system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span>Resume earning money by completing tasks</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handleReactivateAccount}
              disabled={isProcessingPayment || reactivationMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 text-sm sm:text-base font-medium"
              size="lg"
            >
              {isProcessingPayment || reactivationMutation.isPending ? (
                <>
                  <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  <span className="text-xs sm:text-sm">Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Pay ₹{reactivationFee} via Cashfree</span>
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment processing via Cashfree Gateway
            </p>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-gray-600">Need help with your suspension?</p>
              <Button variant="outline" size="sm" onClick={() => setLocation("/support")}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-3 sm:px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2025 Innovative Task Earn. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl text-green-700">Account Reactivated!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">
                Your account has been successfully reactivated!
              </p>
              <p className="text-sm text-gray-600">
                Payment of ₹{reactivationFee} has been processed and recorded.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">You can now:</h4>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Access your dashboard</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Watch videos and earn money</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Track your earnings history</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}