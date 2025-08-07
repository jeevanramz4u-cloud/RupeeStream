import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CashfreePaymentProps {
  amount: number;
  purpose: 'kyc_fee' | 'reactivation_fee';
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function CashfreePayment({ 
  amount, 
  purpose, 
  onSuccess, 
  onError, 
  disabled = false 
}: CashfreePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'init' | 'processing' | 'success' | 'error'>('init');
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');
    
    try {
      // Create payment session
      const response = await fetch(`/api/kyc/create-payment`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }
      
      const { orderId, paymentSessionId } = await response.json();
      
      // For demo purposes, simulate successful payment
      // In production, this would redirect to Cashfree payment page
      setTimeout(async () => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/kyc/verify-payment', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          
          if (verifyResponse.ok) {
            setPaymentStep('success');
            onSuccess(orderId);
            toast({
              title: "Payment Successful!",
              description: purpose === 'kyc_fee' ? 
                "KYC verification completed successfully" : 
                "Account reactivated successfully"
            });
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          setPaymentStep('error');
          onError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('error');
      onError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const getPurposeText = () => {
    return purpose === 'kyc_fee' ? 'KYC Processing Fee' : 'Account Reactivation Fee';
  };

  const getPurposeDescription = () => {
    return purpose === 'kyc_fee' ? 
      'Complete your KYC verification to unlock payout features' :
      'Reactivate your suspended account to continue earning';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          {paymentStep === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <CreditCard className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <CardTitle className="text-xl">
          {paymentStep === 'success' ? 'Payment Successful!' : getPurposeText()}
        </CardTitle>
        <CardDescription>
          {paymentStep === 'success' ? 
            'Your payment has been processed successfully' : 
            getPurposeDescription()
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {paymentStep === 'init' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-lg font-semibold">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Purpose</span>
                <span className="text-sm font-medium">{getPurposeText()}</span>
              </div>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Secure payment powered by Cashfree. Your payment information is encrypted and protected.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handlePayment}
              disabled={disabled || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>
          </>
        )}
        
        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we process your payment securely...
            </p>
          </div>
        )}
        
        {paymentStep === 'success' && (
          <div className="text-center py-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-green-700 dark:text-green-400 mb-2">
              Payment Completed!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {purpose === 'kyc_fee' ? 
                'Your KYC verification is now complete. You can now request payouts.' :
                'Your account has been reactivated successfully.'
              }
            </p>
          </div>
        )}
        
        {paymentStep === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Payment failed. Please try again or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}