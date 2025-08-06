import React, { useEffect, useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuspensionStatus {
  isSuspended: boolean;
  suspendedAt?: string;
  reason?: string;
  reactivationFee?: string;
  reactivationFeePaid?: boolean;
  consecutiveFailedDays: number;
  eligibleForSuspension: boolean;
}

export default function SuspensionAlert() {
  const [suspensionStatus, setSuspensionStatus] = useState<SuspensionStatus | null>(null);
  const [isPayingFee, setIsPayingFee] = useState(false);
  const { toast } = useToast();
  const hasShownToast = useRef(false); // Prevent duplicate toast notifications

  useEffect(() => {
    fetchSuspensionStatus();
  }, []);

  const fetchSuspensionStatus = async () => {
    try {
      const response = await fetch('/api/user/suspension-status');
      if (response.ok) {
        const data = await response.json();
        setSuspensionStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch suspension status:', error);
    }
  };

  const handlePayReactivationFee = async () => {
    setIsPayingFee(true);
    try {
      const response = await fetch('/api/user/pay-reactivation-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (!hasShownToast.current) {
          toast({
            title: "Account Reactivated",
            description: data.message,
            duration: 3000
          });
          hasShownToast.current = true;
        }
        fetchSuspensionStatus(); // Refresh status
      } else {
        toast({
          title: "Payment Failed",
          description: data.message,
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process reactivation fee",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsPayingFee(false);
    }
  };

  if (!suspensionStatus) return null;

  // Account is suspended
  if (suspensionStatus.isSuspended) {
    return (
      <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <div className="flex flex-col gap-3">
            <div>
              <strong>Account Suspended</strong><br />
              <span className="text-sm">Reason: {suspensionStatus.reason}</span>
              {suspensionStatus.suspendedAt && (
                <span className="text-sm block">
                  Suspended on: {new Date(suspensionStatus.suspendedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {!suspensionStatus.reactivationFeePaid && (
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  Pay ₹{suspensionStatus.reactivationFee} reactivation fee to restore access
                </span>
                <Button 
                  onClick={handlePayReactivationFee}
                  disabled={isPayingFee}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isPayingFee ? "Processing..." : `Pay ₹${suspensionStatus.reactivationFee}`}
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // User is at risk of suspension (only show for KYC-completed users)
  if (suspensionStatus.eligibleForSuspension && suspensionStatus.consecutiveFailedDays >= 2) {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>Watch Time Warning</strong><br />
          <span className="text-sm">
            You have {suspensionStatus.consecutiveFailedDays} consecutive days below the 8-hour target. 
            Your account will be suspended after 3 days of missed targets.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning for one missed day (only for KYC-completed users)
  if (suspensionStatus.eligibleForSuspension && suspensionStatus.consecutiveFailedDays === 1) {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Daily Target Missed</strong><br />
          <span className="text-sm">
            You missed yesterday's 8-hour watch time target. Make sure to complete 8 hours today to avoid suspension.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}