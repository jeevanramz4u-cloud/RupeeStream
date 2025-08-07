import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CreditCard, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function SuspendedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const reactivationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/account/reactivate-payment"),
    onSuccess: (data: any) => {
      if (data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        // Development payment completed
        toast({
          title: "Account Reactivated!",
          description: "Your account has been successfully reactivated. You can now access the dashboard.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process reactivation payment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessingPayment(false);
    }
  });

  const handleReactivateAccount = () => {
    setIsProcessingPayment(true);
    reactivationMutation.mutate();
  };

  const suspensionReason = (user as any)?.suspensionReason || "Failed to meet daily watch time requirements for 3 consecutive days";
  const reactivationFee = (user as any)?.reactivationFeeAmount || "49.00";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Suspension Notice */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                <strong>Suspension Reason:</strong> {suspensionReason}
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-gray-600">
              <p>Your account was suspended on {(user as any)?.suspendedAt ? new Date((user as any).suspendedAt).toLocaleDateString() : 'recently'}.</p>
              <p>To continue using EarnPay, you need to reactivate your account.</p>
            </div>
          </CardContent>
        </Card>

        {/* Reactivation Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reactivate Your Account</CardTitle>
            <p className="text-gray-600">Pay the reactivation fee to restore access to your dashboard</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reactivation Fee */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-700">Reactivation Fee</p>
                    <p className="text-sm text-blue-600">One-time payment to restore account access</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700">₹{reactivationFee}</p>
                </div>
              </div>
            </div>

            {/* What happens after reactivation */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">After Reactivation:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>Immediate access to dashboard and videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Fresh start with daily watch time requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span>Resume earning money by watching videos</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handleReactivateAccount}
              disabled={isProcessingPayment || reactivationMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              size="lg"
            >
              {isProcessingPayment || reactivationMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{reactivationFee} & Reactivate Account
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
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Need help with your suspension?</p>
              <Button variant="outline" onClick={() => setLocation("/support")}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}