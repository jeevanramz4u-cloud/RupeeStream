import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, User } from "lucide-react";

interface DemoBannerProps {
  onClose: () => void;
}

export function DemoBanner({ onClose }: DemoBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await apiRequest("GET", "/api/auth/demo-login");
      toast({
        title: "Demo Login Successful",
        description: "Welcome to the EarnPay demo! Explore all features with demo data.",
      });
      // Reload the page to reflect login state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Demo Login Failed",
        description: "Unable to log in with demo account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <User className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Demo Mode Active</h3>
            <p className="text-blue-100 text-sm">
              Database is temporarily offline. Experience the platform with demo data.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                Logging in...
              </>
            ) : (
              "Try Demo Account"
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}