import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  
  // Use traditional auth for our demo login system with retry disabled to prevent infinite loops
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Removed persistent hourly bonus notification to prevent spam
  // The bonus is still awarded automatically, but won't show repeated notifications

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
