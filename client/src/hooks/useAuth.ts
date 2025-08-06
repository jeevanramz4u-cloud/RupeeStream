import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  
  // Use traditional auth for our demo login system
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
  });

  // Show hourly bonus toast when user receives it
  useEffect(() => {
    if (user && (user as any).hourlyBonus && (user as any).hourlyBonus.awarded) {
      toast({
        title: "Hourly Login Bonus! 🎉",
        description: (user as any).hourlyBonus.message,
        duration: 5000,
      });
    }
  }, [user, toast]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
